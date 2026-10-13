const artworkButtons = Array.from(document.querySelectorAll('[data-artwork]'));

if (artworkButtons.length) {
  const viewer = document.createElement('dialog');
  viewer.className = 'art-viewer';
  viewer.setAttribute('aria-label', 'Просмотр работы');
  viewer.innerHTML = '<button type="button" class="art-viewer-close" aria-label="Закрыть просмотр">×</button><button type="button" class="art-viewer-prev" aria-label="Предыдущая работа">←</button><figure><img alt="" /></figure><button type="button" class="art-viewer-next" aria-label="Следующая работа">→</button>';
  document.body.append(viewer);
  const image = viewer.querySelector('img');
  let gallery = [];
  let current = 0;
  let opener;

  const showArtwork = (index) => {
    current = (index + gallery.length) % gallery.length;
    const button = gallery[current];
    const source = button.querySelector('img');
    image.src = source.currentSrc || source.src;
    image.alt = source.alt;
    viewer.querySelector('.art-viewer-prev').hidden = gallery.length < 2;
    viewer.querySelector('.art-viewer-next').hidden = gallery.length < 2;
  };

  artworkButtons.forEach((button) => {
    button.addEventListener('click', () => {
      opener = button;
      const group = button.closest('[data-gallery]');
      gallery = group ? Array.from(group.querySelectorAll('[data-artwork]')) : [button];
      showArtwork(gallery.indexOf(button));
      viewer.showModal();
      document.body.classList.add('art-viewer-open');
      viewer.querySelector('.art-viewer-close').focus();
    });
  });

  viewer.querySelector('.art-viewer-close').addEventListener('click', () => viewer.close());
  viewer.querySelector('.art-viewer-prev').addEventListener('click', () => showArtwork(current - 1));
  viewer.querySelector('.art-viewer-next').addEventListener('click', () => showArtwork(current + 1));
  viewer.addEventListener('close', () => {
    document.body.classList.remove('art-viewer-open');
    opener?.focus({ preventScroll: true });
  });
  viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { event.preventDefault(); viewer.close(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showArtwork(current + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); showArtwork(current - 1); }
  });
}

document.querySelectorAll('[data-deck]').forEach((deck) => {
  const stage = deck.querySelector('[data-slideshow]');
  const buttons = Array.from(deck.querySelectorAll('[data-deck-direction]'));
  if (stage) {
    const slides = Array.from(stage.querySelectorAll('figure'));
    const counter = deck.querySelector('[data-deck-status]');
    let current = 0;
    let gesture;

    const showSlide = (index, initial = false) => {
      current = Math.max(0, Math.min(slides.length - 1, index));
      slides.forEach((slide, position) => {
        slide.hidden = position !== current;
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'слайд');
        slide.setAttribute('aria-label', `${position + 1} из ${slides.length}`);
      });
      counter.textContent = `${current + 1} / ${slides.length}`;
      buttons.forEach((button) => {
        button.disabled = Number(button.dataset.deckDirection) < 0 ? current === 0 : current === slides.length - 1;
      });
      if (!initial) {
        slides[current].querySelector('img').loading = 'eager';
        // Preload the next slide after interaction, not every hidden slide.
        if (slides[current + 1]) slides[current + 1].querySelector('img').loading = 'eager';
      }
    };

    buttons.forEach((button) => button.addEventListener('click', () => showSlide(current + Number(button.dataset.deckDirection))));
    deck.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || !event.target.closest('[data-slideshow],.deck-controls')) return;
      const positions = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 };
      if (!(event.key in positions)) return;
      event.preventDefault();
      showSlide(positions[event.key]);
    });
    stage.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' || !event.isPrimary) return;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    });
    stage.addEventListener('pointerup', (event) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const x = event.clientX - gesture.x;
      const y = event.clientY - gesture.y;
      gesture = null;
      if (Math.abs(x) > Math.min(55, stage.clientWidth * .15) && Math.abs(x) > Math.abs(y) * 1.3) {
        showSlide(current + (x < 0 ? 1 : -1));
      }
    });
    stage.addEventListener('pointercancel', () => { gesture = null; });
    showSlide(0, true);
    return;
  }

  const track = deck.querySelector('.deck-track');
  if (!track) return;
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const slide = track.querySelector('figure');
      const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
      const direction = Number(button.dataset.deckDirection);
      track.scrollBy({ left: (slide.getBoundingClientRect().width + gap) * direction, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
  });
});

const caseLinks = Array.from(document.querySelectorAll('.graphic-anchor-nav a'));
if (caseLinks.length && 'IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      caseLinks.forEach((link) => {
        const active = link.hash === '#' + entry.target.id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-15% 0px -60% 0px' });
  caseLinks.forEach((link) => {
    const section = document.getElementById(link.hash.slice(1));
    if (section) sectionObserver.observe(section);
  });
}
