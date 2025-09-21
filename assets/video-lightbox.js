/**
 * Video Lightbox Modal Component
 * Creates a TikTok/Instagram-style video lightbox with proper video handling
 */

if (!customElements.get('video-lightbox-modal')) {
  customElements.define(
    'video-lightbox-modal',
    class VideoLightboxModal extends ModalDialog {
      constructor() {
        super();
        this.currentVideoIndex = 0;
        this.videos = [];
        this.isFullscreen = false;
        
        this.initializeEventListeners();
      }

      connectedCallback() {
        super.connectedCallback();
        this.setupKeyboardNavigation();
        this.setupTouchGestures();
      }

      initializeEventListeners() {
        // Navigation buttons
        const prevBtn = this.querySelector('.video-lightbox__nav--prev');
        const nextBtn = this.querySelector('.video-lightbox__nav--next');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.navigateVideo(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.navigateVideo(1));

        // Close button - handle both standard and custom IDs
        const closeBtn = this.querySelector('.video-lightbox__close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.hide());

        // Video controls
        this.addEventListener('click', (e) => {
          if (e.target.classList.contains('video-lightbox__play-pause')) {
            this.togglePlayPause();
          } else if (e.target.classList.contains('video-lightbox__mute')) {
            this.toggleMute();
          } else if (e.target.classList.contains('video-lightbox__fullscreen')) {
            this.toggleFullscreen();
          }
        });

        // Close on background click
        this.addEventListener('click', (e) => {
          if (e.target === this || e.target.classList.contains('video-lightbox__backdrop')) {
            this.hide();
          }
        });
      }

      setupKeyboardNavigation() {
        this.addEventListener('keydown', (e) => {
          switch (e.key) {
            case 'Escape':
              e.preventDefault();
              this.hide();
              break;
            case 'ArrowLeft':
              e.preventDefault();
              this.navigateVideo(-1);
              break;
            case 'ArrowRight':
              e.preventDefault();
              this.navigateVideo(1);
              break;
            case ' ':
              e.preventDefault();
              this.togglePlayPause();
              break;
            case 'm':
            case 'M':
              e.preventDefault();
              this.toggleMute();
              break;
            case 'f':
            case 'F':
              e.preventDefault();
              this.toggleFullscreen();
              break;
          }
        });
      }

      setupTouchGestures() {
        let startY = null;
        let startTime = null;

        this.addEventListener('touchstart', (e) => {
          startY = e.touches[0].clientY;
          startTime = Date.now();
        });

        this.addEventListener('touchend', (e) => {
          if (!startY) return;

          const endY = e.changedTouches[0].clientY;
          const diff = startY - endY;
          const duration = Date.now() - startTime;

          // Swipe up/down to navigate videos (like TikTok)
          if (Math.abs(diff) > 100 && duration < 300) {
            if (diff > 0) {
              // Swipe up - next video
              this.navigateVideo(1);
            } else {
              // Swipe down - previous video
              this.navigateVideo(-1);
            }
          }

          startY = null;
          startTime = null;
        });
      }

      show(opener, videoData) {
        console.log('Lightbox show called with:', videoData);
        this.openedBy = opener;
        this.videos = videoData.videos || [];
        this.currentVideoIndex = videoData.startIndex || 0;
        
        console.log('Videos array:', this.videos);
        console.log('Starting index:', this.currentVideoIndex);
        
        super.show(opener);
        this.loadCurrentVideo();
        this.updateNavigationButtons();
        this.updateVideoCounter();
        
        // Show UI initially
        this.showUI();
        this.scheduleUIHide();
      }

      hide() {
        this.pauseCurrentVideo();
        if (this.isFullscreen) {
          document.exitFullscreen?.() || document.webkitExitFullscreen?.();
        }
        super.hide();
      }

      loadCurrentVideo() {
        console.log('Loading video at index:', this.currentVideoIndex);
        const videoContainer = this.querySelector('.video-lightbox__video-container');
        const loadingIndicator = this.querySelector('.video-lightbox__loading');
        const currentVideo = this.videos[this.currentVideoIndex];
        
        console.log('Current video data:', currentVideo);
        
        if (!currentVideo || !videoContainer) {
          console.error('No video data or container found');
          return;
        }

        // Show loading indicator
        if (loadingIndicator) {
          loadingIndicator.style.display = 'flex';
          loadingIndicator.classList.remove('hidden');
        }

        // Clear existing content except loading indicator
        Array.from(videoContainer.children).forEach(child => {
          if (!child.classList.contains('video-lightbox__loading')) {
            child.remove();
          }
        });

        // Create video element with proper dimensions
        const videoElement = this.createVideoElement(currentVideo);
        videoContainer.appendChild(videoElement);

        // Update product info
        this.updateProductInfo(currentVideo);

        // Handle video loading and playing
        if (videoElement.tagName === 'VIDEO') {
          let loadedDataFired = false;
          let canPlayFired = false;

          const handleVideoReady = () => {
            if (loadedDataFired || canPlayFired) return;
            loadedDataFired = true;
            
            // Hide loading indicator
            if (loadingIndicator) {
              loadingIndicator.style.display = 'none';
              loadingIndicator.classList.add('hidden');
            }
            
            // Ensure video is properly sized
            this.adjustVideoSize(videoElement);
            
            // Try to auto-play with better error handling
            const playPromise = videoElement.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log('Video autoplay successful');
                  this.updatePlayPauseButton(false);
                })
                .catch((error) => {
                  console.log('Autoplay prevented:', error.name, error.message);
                  
                  // Try unmuting and playing again
                  if (videoElement.muted && error.name === 'NotAllowedError') {
                    console.log('Attempting to play without mute...');
                    videoElement.muted = false;
                    this.updateMuteButton(false);
                    
                    const secondAttempt = videoElement.play();
                    if (secondAttempt !== undefined) {
                      secondAttempt.catch(() => {
                        console.log('Second autoplay attempt also failed');
                        this.updatePlayPauseButton(true);
                      });
                    }
                  } else {
                    this.updatePlayPauseButton(true);
                  }
                });
            } else {
              // Fallback for older browsers
              try {
                videoElement.play();
                this.updatePlayPauseButton(false);
              } catch (e) {
                console.log('Fallback play failed:', e);
                this.updatePlayPauseButton(true);
              }
            }
          };

          videoElement.addEventListener('loadeddata', handleVideoReady, { once: true });
          videoElement.addEventListener('canplay', () => {
            if (!loadedDataFired) {
              canPlayFired = true;
              handleVideoReady();
            }
          }, { once: true });

          videoElement.addEventListener('loadedmetadata', () => {
            this.adjustVideoSize(videoElement);
          });

          // Enhanced error handling
          videoElement.addEventListener('error', (e) => {
            console.error('Video loading error:', e);
            if (loadingIndicator) {
              loadingIndicator.style.display = 'none';
              loadingIndicator.classList.add('hidden');
            }
            
            // Show error message in UI
            const errorMsg = document.createElement('div');
            errorMsg.className = 'video-error-message';
            errorMsg.style.cssText = `
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: #fff;
              text-align: center;
              padding: 1rem;
              background: rgba(0,0,0,0.8);
              border-radius: 8px;
              font-size: 0.9rem;
            `;
            errorMsg.innerHTML = `
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
              <div>Video failed to load</div>
              <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 0.5rem;">Check your internet connection</div>
            `;
            
            const container = videoElement.closest('.video-lightbox__video-container');
            if (container && !container.querySelector('.video-error-message')) {
              container.appendChild(errorMsg);
            }
          });

          // Add timeout for slow loading videos
          const loadTimeout = setTimeout(() => {
            if (loadingIndicator && !loadedDataFired && !canPlayFired) {
              console.warn('Video taking too long to load, hiding loader');
              loadingIndicator.style.display = 'none';
              loadingIndicator.classList.add('hidden');
              this.updatePlayPauseButton(true);
            }
          }, 10000); // 10 second timeout

          // Clear timeout when video loads
          videoElement.addEventListener('loadstart', () => {
            clearTimeout(loadTimeout);
          }, { once: true });

        } else {
          // For non-video elements, hide loading immediately
          if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
            loadingIndicator.classList.add('hidden');
          }
        }
      }

      createVideoElement(videoData) {
        console.log('Creating video element for:', videoData);
        console.log('Video type:', videoData.type, 'Video file:', videoData.videoFile);
        console.log('Video data keys:', Object.keys(videoData));
        
        // Handle both file uploads and URL videos
        if (videoData.type === 'file' || videoData.type === 'url') {
          // Check if we have a valid video source
          if (!videoData.videoFile || videoData.videoFile === null || videoData.videoFile === '') {
            console.error('No video file provided in videoData:', videoData);
            return this.createVideoPlaceholder('No video source available');
          }

          const video = document.createElement('video');
          video.className = 'video-lightbox__video';
          
          // Clean and validate video URL
          let videoSrc = videoData.videoFile;
          console.log('Lightbox creating video with src:', videoSrc, 'type:', videoData.type);
          
          // Handle different URL formats
          if (videoSrc && videoSrc.startsWith('//')) {
            videoSrc = window.location.protocol + videoSrc;
            console.log('Protocol added to lightbox video:', videoSrc);
          } else if (videoSrc && !videoSrc.startsWith('http') && !videoSrc.startsWith('/')) {
            // Handle relative URLs or incomplete URLs (but not absolute paths)
            videoSrc = window.location.protocol + '//' + videoSrc.replace(/^\/+/, '');
            console.log('Full protocol added to lightbox video:', videoSrc);
          }
          
          // Validate video URL before setting
          if (!videoSrc || videoSrc === 'undefined' || videoSrc === 'null' || videoSrc === '') {
            console.error('Invalid video source:', videoSrc);
            return this.createVideoPlaceholder('Invalid video source');
          }
          
          video.src = videoSrc;
          console.log('Final lightbox video src:', video.src);
          
          // Essential video attributes for better compatibility
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          video.preload = 'metadata';
          video.controls = false;
          video.crossOrigin = 'anonymous'; // Handle CORS issues
          video.setAttribute('playsinline', 'true');
          video.setAttribute('webkit-playsinline', 'true');
          video.setAttribute('x5-video-player-type', 'h5'); // WeChat browser support
          video.setAttribute('x5-video-player-fullscreen', 'true');
          video.setAttribute('x5-video-orientation', 'portraint'); // Portrait mode for mobile
          
          // Enhanced error handling
          video.addEventListener('error', (e) => {
            console.error('Lightbox video error:', e);
            console.error('Failed video src:', video.src);
            console.error('Error code:', video.error?.code);
            console.error('Error message:', video.error?.message);
            
            // Replace with error placeholder
            const errorPlaceholder = this.createVideoPlaceholder('Video failed to load');
            video.parentNode?.replaceChild(errorPlaceholder, video);
          });
          
          video.addEventListener('loadstart', () => {
            console.log('Lightbox video loadstart:', video.src);
          });
          
          video.addEventListener('loadedmetadata', () => {
            console.log('Lightbox video metadata loaded:', video.videoWidth, 'x', video.videoHeight);
          });
          
          video.addEventListener('canplay', () => {
            console.log('Lightbox video can play:', video.src);
          });
          
          // Set proper dimensions
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.objectFit = 'contain';
          video.style.maxWidth = '100vw';
          video.style.maxHeight = '100vh';
          video.style.display = 'block';
          video.style.backgroundColor = '#000';
          
          console.log('Created video element:', video);
          return video;
        }

        // Fallback: try to create video even if type is not recognized but we have videoFile
        if (videoData.videoFile && videoData.videoFile !== '' && videoData.videoFile !== null) {
          console.log('Fallback: Creating video element despite unrecognized type:', videoData.type);
          
          const video = document.createElement('video');
          video.className = 'video-lightbox__video';
          
          let videoSrc = videoData.videoFile;
          
          // Handle different URL formats
          if (videoSrc && videoSrc.startsWith('//')) {
            videoSrc = window.location.protocol + videoSrc;
          } else if (videoSrc && !videoSrc.startsWith('http') && !videoSrc.startsWith('/')) {
            videoSrc = window.location.protocol + '//' + videoSrc.replace(/^\/+/, '');
          }
          
          video.src = videoSrc;
          
          // Essential video attributes
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          video.preload = 'metadata';
          video.controls = false;
          video.crossOrigin = 'anonymous';
          video.setAttribute('playsinline', 'true');
          video.setAttribute('webkit-playsinline', 'true');
          
          // Set proper dimensions
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.objectFit = 'contain';
          video.style.maxWidth = '100vw';
          video.style.maxHeight = '100vh';
          video.style.display = 'block';
          video.style.backgroundColor = '#000';
          
          console.log('Fallback video element created:', video);
          return video;
        }

        // Last resort placeholder for missing or invalid video
        console.log('Creating placeholder - no valid video source found');
        return this.createVideoPlaceholder('Video not available');
      }

      createVideoPlaceholder(message = 'Video not available') {
        console.log('Creating placeholder for:', message);
        const placeholder = document.createElement('div');
        placeholder.className = 'video-lightbox__placeholder';
        placeholder.innerHTML = `
          <div class="placeholder-icon">📹</div>
          <p>${message}</p>
          <p style="font-size: 0.8rem; opacity: 0.6; margin-top: 1rem;">
            Please check your video file or URL
          </p>
        `;
        return placeholder;
      }

      adjustVideoSize(videoElement) {
        if (!videoElement || videoElement.tagName !== 'VIDEO') return;

        const container = this.querySelector('.video-lightbox__video-container');
        if (!container) return;

        // Get video's natural dimensions
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;
        
        if (videoWidth === 0 || videoHeight === 0) return;

        // Get container dimensions
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate aspect ratios
        const videoAspectRatio = videoWidth / videoHeight;
        const containerAspectRatio = containerWidth / containerHeight;

        // Adjust video size based on aspect ratio
        if (videoAspectRatio > containerAspectRatio) {
          // Video is wider than container - fit by width
          videoElement.style.width = '100%';
          videoElement.style.height = 'auto';
        } else {
          // Video is taller than container - fit by height
          videoElement.style.width = 'auto';
          videoElement.style.height = '100%';
        }

        // Ensure centering
        videoElement.style.objectFit = 'contain';
      }

      navigateVideo(direction) {
        this.pauseCurrentVideo();
        
        const newIndex = this.currentVideoIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.videos.length) {
          this.currentVideoIndex = newIndex;
          this.loadCurrentVideo();
          this.updateNavigationButtons();
          this.updateVideoCounter();
        }

        this.showUI();
        this.scheduleUIHide();
      }

      togglePlayPause() {
        const video = this.querySelector('.video-lightbox__video');
        if (video) {
          if (video.paused) {
            // Check if video is ready to play
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
              const playPromise = video.play();
              
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('Video play successful');
                    this.updatePlayPauseButton(false);
                  })
                  .catch((error) => {
                    console.log('Play failed:', error.name, error.message);
                    
                    // Try different strategies based on error type
                    if (error.name === 'NotAllowedError') {
                      // Autoplay policy issue - user gesture required
                      console.log('User interaction required for play');
                      this.updatePlayPauseButton(true);
                      
                      // Show user-friendly message
                      this.showPlayMessage('Tap to play video');
                    } else if (error.name === 'AbortError') {
                      // Video loading was aborted
                      console.log('Video loading aborted, retrying...');
                      setTimeout(() => {
                        if (video.readyState >= 2) {
                          video.play().catch(() => this.updatePlayPauseButton(true));
                        }
                      }, 1000);
                    } else {
                      // Other errors
                      this.updatePlayPauseButton(true);
                    }
                  });
              } else {
                // Fallback for older browsers
                try {
                  video.play();
                  this.updatePlayPauseButton(false);
                } catch (e) {
                  console.log('Fallback play failed:', e);
                  this.updatePlayPauseButton(true);
                }
              }
            } else {
              console.log('Video not ready, current readyState:', video.readyState);
              this.updatePlayPauseButton(true);
              
              // Wait for video to be ready
              const waitForReady = () => {
                if (video.readyState >= 2) {
                  this.togglePlayPause(); // Retry
                } else {
                  setTimeout(waitForReady, 100);
                }
              };
              setTimeout(waitForReady, 100);
            }
          } else {
            video.pause();
            this.updatePlayPauseButton(true);
          }
        }
        
        this.showUI();
        this.scheduleUIHide();
      }

      showPlayMessage(message) {
        // Remove any existing message
        const existingMsg = this.querySelector('.play-message');
        if (existingMsg) existingMsg.remove();
        
        // Create new message
        const msgElement = document.createElement('div');
        msgElement.className = 'play-message';
        msgElement.textContent = message;
        msgElement.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          z-index: 100;
          pointer-events: none;
        `;
        
        const container = this.querySelector('.video-lightbox__video-container');
        if (container) {
          container.appendChild(msgElement);
          
          // Auto-remove after 3 seconds
          setTimeout(() => {
            msgElement.remove();
          }, 3000);
        }
      }

      toggleMute() {
        const video = this.querySelector('.video-lightbox__video');
        if (video) {
          video.muted = !video.muted;
          this.updateMuteButton(video.muted);
        }

        this.showUI();
        this.scheduleUIHide();
      }

      toggleFullscreen() {
        if (!this.isFullscreen) {
          this.requestFullscreen?.() || this.webkitRequestFullscreen?.();
          this.isFullscreen = true;
        } else {
          document.exitFullscreen?.() || document.webkitExitFullscreen?.();
          this.isFullscreen = false;
        }
      }

      pauseCurrentVideo() {
        const video = this.querySelector('.video-lightbox__video');
        if (video && !video.paused) {
          video.pause();
          this.updatePlayPauseButton(true);
        }
      }

      updateNavigationButtons() {
        const prevBtn = this.querySelector('.video-lightbox__nav--prev');
        const nextBtn = this.querySelector('.video-lightbox__nav--next');
        
        if (prevBtn) {
          prevBtn.disabled = this.currentVideoIndex === 0;
          prevBtn.classList.toggle('disabled', this.currentVideoIndex === 0);
        }
        
        if (nextBtn) {
          nextBtn.disabled = this.currentVideoIndex === this.videos.length - 1;
          nextBtn.classList.toggle('disabled', this.currentVideoIndex === this.videos.length - 1);
        }
      }

      updateVideoCounter() {
        const counter = this.querySelector('.video-lightbox__counter');
        if (counter) {
          counter.textContent = `${this.currentVideoIndex + 1} / ${this.videos.length}`;
        }
      }

      updateProductInfo(videoData) {
        const productTitle = this.querySelector('.video-lightbox__product-title');
        const productPrice = this.querySelector('.video-lightbox__product-price');
        const productImage = this.querySelector('.video-lightbox__product-image');
        const shopBtn = this.querySelector('.video-lightbox__shop-btn');

        if (productTitle && videoData.productTitle) {
          productTitle.textContent = videoData.productTitle;
        }

        if (productPrice && videoData.productPrice) {
          productPrice.textContent = videoData.productPrice;
        }

        if (productImage && videoData.productImage) {
          // Use larger image on desktop, smaller on mobile
          const imageUrl = window.innerWidth > 768 && videoData.productImageLarge 
            ? videoData.productImageLarge 
            : videoData.productImage;
            
          productImage.src = imageUrl;
          productImage.alt = videoData.productTitle || 'Product image';
          productImage.style.display = 'block';
          
          // Handle image loading errors gracefully
          productImage.onerror = function() {
            this.style.display = 'none';
            console.warn('Failed to load product image:', imageUrl);
          };
          
          productImage.onload = function() {
            console.log('Product image loaded successfully:', imageUrl);
          };
        } else if (productImage) {
          productImage.style.display = 'none';
        }

        if (shopBtn && videoData.productUrl) {
          shopBtn.href = videoData.productUrl;
          shopBtn.style.display = 'inline-block';
        } else if (shopBtn) {
          shopBtn.style.display = 'none';
        }
      }

      updatePlayPauseButton(isPaused) {
        const playIcon = this.querySelector('.play-icon');
        const pauseIcon = this.querySelector('.pause-icon');
        
        if (playIcon && pauseIcon) {
          playIcon.style.display = isPaused ? 'block' : 'none';
          pauseIcon.style.display = isPaused ? 'none' : 'block';
        }
      }

      updateMuteButton(isMuted) {
        const volumeIcon = this.querySelector('.volume-icon');
        const muteIcon = this.querySelector('.mute-icon');
        
        if (volumeIcon && muteIcon) {
          volumeIcon.style.display = isMuted ? 'none' : 'block';
          muteIcon.style.display = isMuted ? 'block' : 'none';
        }
      }

      showUI() {
        const controls = this.querySelector('.video-lightbox__controls');
        const navigation = this.querySelector('.video-lightbox__navigation');
        const productInfo = this.querySelector('.video-lightbox__product-info');
        const counter = this.querySelector('.video-lightbox__counter');
        const closeBtn = this.querySelector('.video-lightbox__close');
        
        [controls, navigation, productInfo, counter, closeBtn].forEach(element => {
          if (element) {
            element.classList.add('visible');
          }
        });
      }

      hideUI() {
        const controls = this.querySelector('.video-lightbox__controls');
        const navigation = this.querySelector('.video-lightbox__navigation');
        const productInfo = this.querySelector('.video-lightbox__product-info');
        
        [controls, navigation, productInfo].forEach(element => {
          if (element) {
            element.classList.remove('visible');
          }
        });
      }

      scheduleUIHide() {
        if (this.uiHideTimeout) {
          clearTimeout(this.uiHideTimeout);
        }
        
        this.uiHideTimeout = setTimeout(() => {
          this.hideUI();
        }, 3000);
      }
    }
  );
}
