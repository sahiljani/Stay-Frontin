/**
 * Product Media Gallery with Embla Carousel
 *
 * Features:
 * - Thumbnail navigation synced with main carousel
 * - Variant-based image switching
 * - Keyboard navigation support
 * - Responsive behavior
 */

if (!customElements.get('media-gallery-embla')) {
  customElements.define(
    'media-gallery-embla',
    class MediaGalleryEmbla extends HTMLElement {
      constructor() {
        super();

        this.sectionId = this.dataset.sectionId;
        this.productId = this.dataset.productId;
        this.mainEmbla = null;
        this.thumbsEmbla = null;
        this.mediaData = null;

        // Elements
        this.mainCarousel = this.querySelector('[data-embla-init]');
        this.thumbsCarousel = this.querySelector('[data-embla-thumbnails]');
        this.thumbnails = this.querySelectorAll('[data-thumbnail-button]');
        this.counter = this.querySelector('.media-gallery-embla__counter-current');

        this.init();
      }

      init() {
        // Load media data
        this.loadMediaData();

        // Wait for Embla to be available
        this.waitForEmbla(() => {
          this.initializeCarousels();
          this.bindEvents();
        });

        // Listen for variant changes
        this.onVariantChangeUnsubscriber = subscribe(
          PUB_SUB_EVENTS.optionValueSelectionChange,
          this.handleVariantChange.bind(this)
        );
      }

      loadMediaData() {
        const dataScript = this.querySelector('[data-media-gallery-data]');
        if (dataScript) {
          try {
            this.mediaData = JSON.parse(dataScript.textContent);
          } catch (e) {
            console.error('Error parsing media gallery data:', e);
          }
        }
      }

      waitForEmbla(callback) {
        if (window.EmblaCarousel) {
          callback();
          return;
        }

        const checkEmbla = setInterval(() => {
          if (window.EmblaCarousel) {
            clearInterval(checkEmbla);
            callback();
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => clearInterval(checkEmbla), 10000);
      }

      initializeCarousels() {
        // Initialize main carousel
        if (this.mainCarousel && this.mainCarousel.__embla) {
          this.mainEmbla = this.mainCarousel.__embla;
          this.setupMainCarousel();
        }

        // Initialize thumbnail carousel
        if (this.thumbsCarousel) {
          this.initThumbnailCarousel();
        }

        // Sync carousels if both exist
        if (this.mainEmbla && this.thumbsEmbla) {
          this.syncCarousels();
        }
      }

      initThumbnailCarousel() {
        const viewport = this.thumbsCarousel.querySelector('.embla__viewport');
        if (!viewport) return;

        const isVertical = this.classList.contains('media-gallery-embla--left');

        this.thumbsEmbla = window.EmblaCarousel(viewport, {
          axis: isVertical ? 'y' : 'x',
          align: 'start',
          containScroll: 'keepSnaps',
          dragFree: false,
          slidesToScroll: 1,
          skipSnaps: false,
          duration: 20,
          inViewThreshold: 0.7
        });

        // Setup navigation buttons for thumbnails
        const sectionId = `thumbs-${this.sectionId}`;
        const prevBtn = document.getElementById(`prev-${sectionId}`);
        const nextBtn = document.getElementById(`next-${sectionId}`);

        if (prevBtn && nextBtn) {
          prevBtn.addEventListener('click', () => {
            this.thumbsEmbla.scrollPrev();
            this.addClickAnimation(prevBtn);
          });
          nextBtn.addEventListener('click', () => {
            this.thumbsEmbla.scrollNext();
            this.addClickAnimation(nextBtn);
          });

          const updateButtons = () => {
            prevBtn.disabled = !this.thumbsEmbla.canScrollPrev();
            nextBtn.disabled = !this.thumbsEmbla.canScrollNext();
            prevBtn.classList.toggle('disabled', prevBtn.disabled);
            nextBtn.classList.toggle('disabled', nextBtn.disabled);
          };

          this.thumbsEmbla.on('select', updateButtons);
          this.thumbsEmbla.on('reInit', updateButtons);
          updateButtons();
        }

        // Auto-scroll thumbnail into view when selected
        this.thumbsEmbla.on('select', () => {
          this.scrollActiveThumbnailIntoView();
        });
      }

      setupMainCarousel() {
        // Update counter on slide change with animation
        this.mainEmbla.on('select', () => {
          this.updateCounter();
          this.updateActiveThumbnail();
          this.animateSlideChange();
        });

        // Handle dragging state
        const container = this.mainCarousel.querySelector('.embla__container');
        this.mainEmbla.on('pointerDown', () => {
          if (container) container.classList.add('is-dragging');
        });
        this.mainEmbla.on('pointerUp', () => {
          if (container) container.classList.remove('is-dragging');
        });

        // Setup navigation buttons for main carousel
        const prevBtn = document.getElementById(`prev-main-${this.sectionId}`);
        const nextBtn = document.getElementById(`next-main-${this.sectionId}`);

        if (prevBtn && nextBtn) {
          prevBtn.addEventListener('click', () => {
            this.mainEmbla.scrollPrev();
            this.addClickAnimation(prevBtn);
          });
          nextBtn.addEventListener('click', () => {
            this.mainEmbla.scrollNext();
            this.addClickAnimation(nextBtn);
          });

          const updateButtons = () => {
            prevBtn.disabled = !this.mainEmbla.canScrollPrev();
            nextBtn.disabled = !this.mainEmbla.canScrollNext();
            prevBtn.classList.toggle('disabled', prevBtn.disabled);
            nextBtn.classList.toggle('disabled', nextBtn.disabled);
          };

          this.mainEmbla.on('select', updateButtons);
          this.mainEmbla.on('reInit', updateButtons);
          updateButtons();
        }
      }

      syncCarousels() {
        // When main carousel changes, update thumbnails to keep active thumbnail centered/visible
        this.mainEmbla.on('select', () => {
          const selectedIndex = this.mainEmbla.selectedScrollSnap();

          // Scroll thumbnail carousel to show the active thumbnail
          if (this.thumbsEmbla) {
            const slides = this.thumbsEmbla.slideNodes();
            const targetSlide = slides[selectedIndex];

            if (targetSlide) {
              // Check if thumbnail is in view
              const isInView = this.thumbsEmbla.slidesInView().includes(selectedIndex);

              if (!isInView) {
                // Scroll to make the thumbnail visible
                this.thumbsEmbla.scrollTo(selectedIndex);
              }
            }
          }
        });
      }

      bindEvents() {
        // Thumbnail click events with animation
        this.thumbnails.forEach((thumbnail, index) => {
          thumbnail.addEventListener('click', (e) => {
            this.setActiveMedia(index);
            this.addClickAnimation(thumbnail);

            // Add ripple effect
            this.createRipple(e, thumbnail);
          });

          // Hover effects
          thumbnail.addEventListener('mouseenter', () => {
            if (!thumbnail.classList.contains('is-active')) {
              thumbnail.classList.add('is-hovered');
            }
          });

          thumbnail.addEventListener('mouseleave', () => {
            thumbnail.classList.remove('is-hovered');
          });
        });

        // Keyboard navigation
        this.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            this.mainEmbla?.scrollNext();
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            this.mainEmbla?.scrollPrev();
          }
        });
      }

      setActiveMedia(index, animate = true) {
        if (!this.mainEmbla) return;

        // Add transition class for smooth animation
        if (animate) {
          const slides = this.querySelectorAll('.embla__slide');
          slides.forEach(slide => slide.classList.add('transitioning'));

          setTimeout(() => {
            slides.forEach(slide => slide.classList.remove('transitioning'));
          }, 400);
        }

        this.mainEmbla.scrollTo(index);
        this.updateActiveThumbnail(index);
        this.updateCounter(index);
      }

      updateActiveThumbnail(index = null) {
        const currentIndex = index !== null ? index : this.mainEmbla.selectedScrollSnap();

        this.thumbnails.forEach((thumb, i) => {
          if (i === currentIndex) {
            // Remove from previous active
            this.thumbnails.forEach(t => t.classList.remove('is-active'));

            // Add to new active with animation
            thumb.classList.add('is-active');
            thumb.setAttribute('aria-current', 'true');

            // Pulse animation on activation
            thumb.classList.add('pulse-active');
            setTimeout(() => thumb.classList.remove('pulse-active'), 300);
          } else {
            thumb.classList.remove('is-active');
            thumb.setAttribute('aria-current', 'false');
          }
        });
      }

      updateCounter(index = null) {
        if (!this.counter) return;

        const currentIndex = index !== null ? index : this.mainEmbla.selectedScrollSnap();
        const newCount = currentIndex + 1;

        // Animate counter change
        if (this.counter.textContent !== newCount.toString()) {
          this.counter.classList.add('counter-update');
          this.counter.textContent = newCount;

          setTimeout(() => {
            this.counter.classList.remove('counter-update');
          }, 300);
        }
      }

      // Animation helpers
      addClickAnimation(element) {
        element.classList.add('clicked');
        setTimeout(() => element.classList.remove('clicked'), 200);
      }

      createRipple(event, element) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      }

      animateSlideChange() {
        const activeSlide = this.querySelector('.embla__slide.is-active');
        if (activeSlide) {
          activeSlide.classList.add('slide-in');
          setTimeout(() => activeSlide.classList.remove('slide-in'), 400);
        }
      }

      scrollActiveThumbnailIntoView() {
        const currentIndex = this.mainEmbla?.selectedScrollSnap();
        if (currentIndex === undefined || !this.thumbsEmbla) return;

        const slides = this.thumbsEmbla.slideNodes();
        const targetSlide = slides[currentIndex];

        if (targetSlide && !this.thumbsEmbla.slidesInView().includes(currentIndex)) {
          this.thumbsEmbla.scrollTo(currentIndex);
        }
      }

      handleVariantChange({ data: { event, variant } }) {
        // Only handle variant changes for this product
        if (!variant || !this.mediaData) return;

        // Find media associated with this variant
        const variantMedia = this.mediaData.mediaData.find(media => {
          return media.variantIds && media.variantIds.includes(variant.id);
        });

        if (variantMedia) {
          // Find the index of this media
          const mediaIndex = this.mediaData.mediaData.findIndex(m => m.id === variantMedia.id);
          if (mediaIndex !== -1) {
            this.setActiveMedia(mediaIndex);
          }
        }
      }

      disconnectedCallback() {
        // Cleanup
        if (this.onVariantChangeUnsubscriber) {
          this.onVariantChangeUnsubscriber();
        }

        if (this.mainEmbla) {
          this.mainEmbla.destroy();
        }

        if (this.thumbsEmbla) {
          this.thumbsEmbla.destroy();
        }
      }
    }
  );
}

// Initialize on section load events
document.addEventListener('shopify:section:load', (event) => {
  const gallery = event.target.querySelector('media-gallery-embla');
  if (gallery) {
    // Reinitialize the gallery
    gallery.init();
  }
});
