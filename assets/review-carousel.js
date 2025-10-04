/**
 * Review Carousel with Embla
 * Auto-rotating customer reviews with manual controls
 */

(function() {
  function initReviewCarousels() {
    if (!window.EmblaCarousel) return;

    document.querySelectorAll('[data-review-carousel]').forEach(function(carouselElement) {
      const emblaRoot = carouselElement.querySelector('.embla--reviews');
      if (!emblaRoot || emblaRoot.__embla) return;

      const viewport = emblaRoot.querySelector('.embla__viewport');
      if (!viewport) return;

      const sectionId = emblaRoot.getAttribute('data-section-id');
      const autoplaySpeed = parseInt(emblaRoot.getAttribute('data-autoplay') || '5000', 10);
      const hasAutoplay = emblaRoot.hasAttribute('data-autoplay');

      // Initialize Embla
      const embla = window.EmblaCarousel(viewport, {
        loop: true,
        align: 'center',
        skipSnaps: false,
        dragFree: false,
        containScroll: 'trimSnaps'
      });

      emblaRoot.__embla = embla;

      // Setup navigation buttons
      const prevBtn = document.getElementById('prev-' + sectionId);
      const nextBtn = document.getElementById('next-' + sectionId);

      if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function() {
          embla.scrollPrev();
          resetAutoplay();
        });
        nextBtn.addEventListener('click', function() {
          embla.scrollNext();
          resetAutoplay();
        });

        const updateButtons = function() {
          prevBtn.disabled = !embla.canScrollPrev();
          nextBtn.disabled = !embla.canScrollNext();
        };

        embla.on('select', updateButtons);
        embla.on('reInit', updateButtons);
        updateButtons();
      }

      // Setup dots
      const dotsContainer = emblaRoot.querySelector('[data-carousel-dots]');
      if (dotsContainer) {
        const slides = embla.slideNodes();
        const dots = [];

        slides.forEach(function(_, index) {
          const dot = document.createElement('button');
          dot.className = 'review-carousel__dot';
          dot.setAttribute('aria-label', 'Go to review ' + (index + 1));
          dot.addEventListener('click', function() {
            embla.scrollTo(index);
            resetAutoplay();
          });
          dotsContainer.appendChild(dot);
          dots.push(dot);
        });

        const updateDots = function() {
          const selectedIndex = embla.selectedScrollSnap();
          dots.forEach(function(dot, index) {
            if (index === selectedIndex) {
              dot.classList.add('is-active');
            } else {
              dot.classList.remove('is-active');
            }
          });
        };

        embla.on('select', updateDots);
        embla.on('reInit', updateDots);
        updateDots();
      }

      // Autoplay functionality
      let autoplayInterval = null;

      function startAutoplay() {
        if (!hasAutoplay) return;

        stopAutoplay();
        autoplayInterval = setInterval(function() {
          if (embla.canScrollNext()) {
            embla.scrollNext();
          } else {
            embla.scrollTo(0);
          }
        }, autoplaySpeed);
      }

      function stopAutoplay() {
        if (autoplayInterval) {
          clearInterval(autoplayInterval);
          autoplayInterval = null;
        }
      }

      function resetAutoplay() {
        stopAutoplay();
        setTimeout(startAutoplay, 1000);
      }

      // Start autoplay
      if (hasAutoplay) {
        startAutoplay();

        // Pause on hover
        emblaRoot.addEventListener('mouseenter', stopAutoplay);
        emblaRoot.addEventListener('mouseleave', startAutoplay);

        // Pause when user interacts
        embla.on('pointerDown', stopAutoplay);
      }

      // Fade in/out animation on slide change
      embla.on('select', function() {
        const slides = embla.slideNodes();
        const selectedIndex = embla.selectedScrollSnap();

        slides.forEach(function(slide, index) {
          const card = slide.querySelector('.review-carousel__card');
          if (!card) return;

          if (index === selectedIndex) {
            card.style.opacity = '0';
            setTimeout(function() {
              card.style.transition = 'opacity 0.4s ease-in-out';
              card.style.opacity = '1';
            }, 100);
          } else {
            card.style.opacity = '0.5';
          }
        });
      });

      // Initial animation
      const initialCard = emblaRoot.querySelector('.embla__slide .review-carousel__card');
      if (initialCard) {
        initialCard.style.opacity = '1';
      }
    });
  }

  // Load Embla if not already loaded
  function loadEmbla() {
    if (window.EmblaCarousel) {
      initReviewCarousels();
      return;
    }

    if (document.getElementById('embla-carousel-lib')) {
      document.getElementById('embla-carousel-lib').addEventListener('load', initReviewCarousels, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'embla-carousel-lib';
    script.src = 'https://cdn.jsdelivr.net/npm/embla-carousel@8.0.0/embla-carousel.umd.js';
    script.async = true;
    script.onload = initReviewCarousels;
    document.head.appendChild(script);
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadEmbla);
  } else {
    loadEmbla();
  }

  // Reinitialize on section load (Shopify theme editor)
  document.addEventListener('shopify:section:load', initReviewCarousels);
})();
