(function(){
  function initAll(){
    if(!window.EmblaCarousel) return;
    document.querySelectorAll('.embla[data-embla-init]')
      .forEach(function(root){
        if(root.__embla) return;
        var viewport = root.querySelector('.embla__viewport');
        if(!viewport) return;
        var increment = parseInt(root.getAttribute('data-scroll-cards') || '1', 10);
        var embla = EmblaCarousel(viewport, {
          align: 'start',
          containScroll: 'trimSnaps',
          dragFree: true,
          skipSnaps: false,
          dragThreshold: 8,
          watchDrag: true,
          watchResize: true,
          watchSlides: true,
          loop: false,
          startIndex: 0
        });
        root.__embla = embla;
        var sectionId = root.getAttribute('data-section-id');
        var prev = document.getElementById('prev-' + sectionId);
        var next = document.getElementById('next-' + sectionId);
        function scrollByGroup(dir){
          var current = embla.selectedScrollSnap();
          var last = embla.scrollSnapList().length - 1;
            var target = Math.min(last, Math.max(0, current + dir * increment));
          embla.scrollTo(target);
        }
        if(prev) prev.addEventListener('click', function(){ scrollByGroup(-1); });
        if(next) next.addEventListener('click', function(){ scrollByGroup(1); });
        function update(){
          if(prev){ prev.disabled = !embla.canScrollPrev(); prev.classList.toggle('disabled', prev.disabled); }
          if(next){ next.disabled = !embla.canScrollNext(); next.classList.toggle('disabled', next.disabled); }
        }
        embla.on('select', update);
        embla.on('reInit', update);
        var container = viewport.querySelector('.embla__container');
        embla.on('pointerDown', function() {
          if(container) container.classList.add('is-dragging');
        });
        embla.on('pointerUp', function() {
          if(container) container.classList.remove('is-dragging');
        });
        update();
        root.addEventListener('keydown', function(e){
          if(e.key === 'ArrowRight') scrollByGroup(1);
          if(e.key === 'ArrowLeft') scrollByGroup(-1);
        });
      });
  }

  function loadEmbla(){
    if(window.EmblaCarousel){ initAll(); return; }
    if(document.getElementById('embla-carousel-lib')){
      document.getElementById('embla-carousel-lib').addEventListener('load', initAll, { once: true });
      return;
    }
    var s = document.createElement('script');
    s.id = 'embla-carousel-lib';
    s.src = 'https://cdn.jsdelivr.net/npm/embla-carousel@8.0.0/embla-carousel.umd.js';
    s.async = true;
    s.onload = initAll;
    document.head.appendChild(s);
  }

  document.addEventListener('shopify:section:load', initAll);
  document.addEventListener('DOMContentLoaded', loadEmbla);
})();