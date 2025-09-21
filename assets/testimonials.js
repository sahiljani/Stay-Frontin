/**
 * Testimonials JavaScript
 * Handles testimonial interactions, photo/video modals, and helpful voting
 */

class Testimonials {
  constructor() {
    this.helpfulVotes = new Map();
    this.loadedTestimonials = 0;
    this.testimonialsPerLoad = 8;
    this.init();
  }

  init() {
    this.bindEvents();
    this.initializeHelpfulCounts();
    this.initializeAnimations();
  }

  bindEvents() {
    // Helpful button clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.helpful-btn')) {
        const button = e.target.closest('.helpful-btn');
        const testimonialId = button.dataset.testimonial;
        this.handleHelpfulClick(button, testimonialId);
      }
    });

    // Photo expand clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.expand-photo-btn')) {
        const photoCard = e.target.closest('.photo-review');
        const photoImg = photoCard.querySelector('.review-photo img');
        if (photoImg) {
          this.openPhotoModal(photoImg.src, photoImg.alt);
        }
      }
    });

    // Video play clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.play-video-btn')) {
        const button = e.target.closest('.play-video-btn');
        const videoUrl = button.dataset.videoUrl;
        if (videoUrl) {
          this.openVideoModal(videoUrl);
        }
      }
    });

    // Load more button
    const loadMoreBtn = document.getElementById('load-more-testimonials');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.loadMoreTestimonials());
    }

    // Modal close handlers
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop') || 
          e.target.classList.contains('modal-close')) {
        this.closeAllModals();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Star rating hovers (for interactive elements)
    document.addEventListener('mouseenter', (e) => {
      if (e.target.classList.contains('star')) {
        this.handleStarHover(e.target, true);
      }
    });

    document.addEventListener('mouseleave', (e) => {
      if (e.target.classList.contains('star')) {
        this.handleStarHover(e.target, false);
      }
    });
  }

  initializeHelpfulCounts() {
    // Load helpful counts from localStorage or initialize
    const savedCounts = localStorage.getItem('testimonial-helpful-votes');
    if (savedCounts) {
      this.helpfulVotes = new Map(JSON.parse(savedCounts));
    }

    // Update UI with saved votes
    this.helpfulVotes.forEach((voted, testimonialId) => {
      if (voted) {
        const button = document.querySelector(`[data-testimonial="${testimonialId}"]`);
        if (button) {
          button.classList.add('active');
        }
      }
    });
  }

  initializeAnimations() {
    // Set up intersection observer for animations
    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.style.animationPlayState = 'running';
            }
          });
        },
        { threshold: 0.1 }
      );

      document.querySelectorAll('.testimonial-card').forEach(card => {
        card.style.animationPlayState = 'paused';
        observer.observe(card);
      });
    }
  }

  handleHelpfulClick(button, testimonialId) {
    const hasVoted = this.helpfulVotes.get(testimonialId);
    
    if (hasVoted) {
      // Already voted, show message
      this.showToast('You have already found this review helpful!', 'info');
      return;
    }

    // Mark as voted
    this.helpfulVotes.set(testimonialId, true);
    button.classList.add('active');

    // Update count
    const countElement = button.querySelector('.helpful-count');
    if (countElement) {
      const currentCount = parseInt(countElement.textContent.replace(/[()]/g, '')) || 0;
      countElement.textContent = `(${currentCount + 1})`;
    }

    // Save to localStorage
    localStorage.setItem('testimonial-helpful-votes', JSON.stringify([...this.helpfulVotes]));

    // Visual feedback
    this.animateHelpfulClick(button);
    this.showToast('Thanks for your feedback!', 'success');

    // Send to analytics or server if needed
    this.trackHelpfulVote(testimonialId);
  }

  animateHelpfulClick(button) {
    const thumbsUp = button.querySelector('.thumbs-up');
    if (thumbsUp) {
      thumbsUp.style.animation = 'bounce 0.6s ease';
      setTimeout(() => {
        thumbsUp.style.animation = '';
      }, 600);
    }

    // Button pulse effect
    button.style.transform = 'scale(1.05)';
    setTimeout(() => {
      button.style.transform = '';
    }, 200);
  }

  openPhotoModal(imageSrc, imageAlt) {
    const modal = document.getElementById('photo-modal');
    const modalImage = document.getElementById('modal-image');
    
    if (modal && modalImage) {
      modalImage.src = imageSrc;
      modalImage.alt = imageAlt || 'Customer photo';
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      
      // Add fade-in animation
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.style.opacity = '1';
      }, 10);
    }
  }

  openVideoModal(videoUrl) {
    const modal = document.getElementById('video-modal');
    const videoContainer = document.getElementById('video-container');
    
    if (modal && videoContainer) {
      // Convert video URL to embed format
      const embedUrl = this.getEmbedUrl(videoUrl);
      if (embedUrl) {
        videoContainer.innerHTML = `
          <iframe src="${embedUrl}" 
                  allowfullscreen 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
          </iframe>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add fade-in animation
        modal.style.opacity = '0';
        setTimeout(() => {
          modal.style.opacity = '1';
        }, 10);
      }
    }
  }

  getEmbedUrl(url) {
    // YouTube URL conversion
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    }
    
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    }
    
    // Vimeo URL conversion
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : null;
    }
    
    return url; // Return as-is if already an embed URL
  }

  closeAllModals() {
    const modals = document.querySelectorAll('.photo-modal, .video-modal');
    modals.forEach(modal => {
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.style.display = 'none';
        
        // Clear video content to stop playback
        const videoContainer = modal.querySelector('.video-container');
        if (videoContainer) {
          videoContainer.innerHTML = '';
        }
      }, 300);
    });
    
    document.body.style.overflow = 'auto';
  }

  async loadMoreTestimonials() {
    const loadMoreBtn = document.getElementById('load-more-testimonials');
    if (!loadMoreBtn) return;

    try {
      // Show loading state
      this.setLoadingState(loadMoreBtn, true);

      // Simulate API call to load more testimonials
      // In a real implementation, this would fetch from your testimonials API
      const newTestimonials = await this.fetchMoreTestimonials();
      
      if (newTestimonials && newTestimonials.length > 0) {
        this.appendTestimonials(newTestimonials);
        this.loadedTestimonials += newTestimonials.length;
        
        // Hide load more button if no more testimonials
        if (newTestimonials.length < this.testimonialsPerLoad) {
          loadMoreBtn.style.display = 'none';
        }
      } else {
        loadMoreBtn.style.display = 'none';
        this.showToast('No more reviews to load', 'info');
      }

    } catch (error) {
      console.error('Error loading more testimonials:', error);
      this.showToast('Failed to load more reviews', 'error');
    } finally {
      this.setLoadingState(loadMoreBtn, false);
    }
  }

  async fetchMoreTestimonials() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock testimonial data - in real implementation, this would come from your API
    const mockTestimonials = [
      {
        type: 'testimonial',
        customerName: 'Alex Johnson',
        customerLocation: 'Toronto, CA',
        rating: 5,
        testimonialTitle: 'Exceeded my expectations',
        testimonialText: 'I was skeptical at first, but this product really works. The quality is outstanding and the results speak for themselves.',
        reviewDate: new Date().toISOString(),
        verifiedPurchase: true
      },
      {
        type: 'testimonial',
        customerName: 'Emma Davis',
        customerLocation: 'London, UK',
        rating: 4,
        testimonialText: 'Great value for money. Would recommend to anyone looking for a reliable solution.',
        reviewDate: new Date().toISOString(),
        verifiedPurchase: true
      }
    ];

    return mockTestimonials;
  }

  appendTestimonials(testimonials) {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;

    testimonials.forEach((testimonial, index) => {
      const testimonialElement = this.createTestimonialElement(testimonial);
      testimonialElement.style.opacity = '0';
      testimonialElement.style.transform = 'translateY(30px)';
      
      grid.appendChild(testimonialElement);
      
      // Animate in
      setTimeout(() => {
        testimonialElement.style.transition = 'all 0.6s ease';
        testimonialElement.style.opacity = '1';
        testimonialElement.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  createTestimonialElement(testimonial) {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    
    const starsHtml = Array.from({length: 5}, (_, i) => 
      `<span class="star ${i < testimonial.rating ? 'filled' : ''}">★</span>`
    ).join('');

    card.innerHTML = `
      <div class="testimonial-content">
        <div class="testimonial-header">
          <div class="customer-info">
            <div class="customer-avatar placeholder">
              <span>${testimonial.customerName.charAt(0).toUpperCase()}</span>
            </div>
            <div class="customer-details">
              <h4 class="customer-name">${testimonial.customerName}</h4>
              ${testimonial.customerLocation ? `<p class="customer-location">${testimonial.customerLocation}</p>` : ''}
              ${testimonial.verifiedPurchase ? '<span class="verified-badge">✓ Verified Purchase</span>' : ''}
            </div>
          </div>
          <div class="testimonial-rating">
            ${starsHtml}
          </div>
        </div>
        <div class="testimonial-body">
          ${testimonial.testimonialTitle ? `<h5 class="testimonial-title">"${testimonial.testimonialTitle}"</h5>` : ''}
          <blockquote class="testimonial-text">${testimonial.testimonialText}</blockquote>
        </div>
        <div class="testimonial-footer">
          <time class="review-date">${new Date(testimonial.reviewDate).toLocaleDateString()}</time>
          <div class="testimonial-actions">
            <button class="helpful-btn" type="button" data-testimonial="new-${Date.now()}">
              <span class="thumbs-up">👍</span>
              <span class="helpful-text">Helpful</span>
              <span class="helpful-count">(0)</span>
            </button>
          </div>
        </div>
      </div>
    `;

    return card;
  }

  setLoadingState(button, isLoading) {
    if (isLoading) {
      button.classList.add('loading');
      button.disabled = true;
      const btnText = button.querySelector('.btn-text');
      if (btnText) {
        btnText.dataset.originalText = btnText.textContent;
        btnText.textContent = 'Loading...';
      }
    } else {
      button.classList.remove('loading');
      button.disabled = false;
      const btnText = button.querySelector('.btn-text');
      if (btnText && btnText.dataset.originalText) {
        btnText.textContent = btnText.dataset.originalText;
      }
    }
  }

  handleStarHover(star, isEntering) {
    if (isEntering) {
      star.style.transform = 'scale(1.1)';
    } else {
      star.style.transform = '';
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `testimonial-toast testimonial-toast--${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    `;

    switch (type) {
      case 'success':
        toast.style.background = 'var(--testimonial-success)';
        break;
      case 'error':
        toast.style.background = '#dc2626';
        break;
      case 'info':
      default:
        toast.style.background = 'var(--testimonial-primary)';
        break;
    }

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  trackHelpfulVote(testimonialId) {
    // Send analytics or track helpful votes
    if (window.gtag) {
      gtag('event', 'testimonial_helpful', {
        event_category: 'engagement',
        event_label: testimonialId
      });
    }

    // Could also send to your analytics service
    console.log(`Helpful vote for testimonial: ${testimonialId}`);
  }

  // Public methods for external integration
  getHelpfulVotes() {
    return Object.fromEntries(this.helpfulVotes);
  }

  addTestimonial(testimonialData) {
    const testimonials = [testimonialData];
    this.appendTestimonials(testimonials);
  }

  filterTestimonials(rating) {
    const cards = document.querySelectorAll('.testimonial-card');
    cards.forEach(card => {
      const cardRating = card.querySelectorAll('.testimonial-rating .star.filled').length;
      if (rating === 'all' || cardRating >= rating) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
}

// Global modal close functions
window.closePhotoModal = function() {
  const testimonials = window.testimonialsInstance;
  if (testimonials) {
    testimonials.closeAllModals();
  }
};

window.closeVideoModal = function() {
  const testimonials = window.testimonialsInstance;
  if (testimonials) {
    testimonials.closeAllModals();
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if testimonials section exists
  if (document.querySelector('.testimonials-section')) {
    window.testimonialsInstance = new Testimonials();
  }
});

// Export for external use
window.Testimonials = Testimonials;