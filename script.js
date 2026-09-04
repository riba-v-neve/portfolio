const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (menuButton && mobileMenu) {
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  menuButton.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(willOpen));
    menuButton.setAttribute('aria-label', willOpen ? 'Закрыть меню' : 'Открыть меню');
    mobileMenu.classList.toggle('is-open', willOpen);
    document.body.classList.toggle('menu-open', willOpen);
  });

  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
}

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const spotlight = document.querySelector('[data-spotlight]');
if (spotlight && window.matchMedia('(pointer: fine)').matches) {
  spotlight.addEventListener('pointermove', (event) => {
    const bounds = spotlight.getBoundingClientRect();
    spotlight.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
    spotlight.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
  });
}

const tickerTrack = document.querySelector('.ticker-track');
const tickerGroup = tickerTrack?.querySelector('[data-ticker-group]');

if (tickerTrack && tickerGroup) {
  const baseItems = tickerGroup.innerHTML;
  const duplicateGroup = tickerTrack.querySelector('.ticker-group[aria-hidden="true"]');
  let tickerResizeFrame;

  const fillTicker = () => {
    tickerGroup.innerHTML = baseItems;

    while (tickerGroup.scrollWidth < window.innerWidth * 1.15) {
      tickerGroup.insertAdjacentHTML('beforeend', baseItems);
    }

    if (duplicateGroup) duplicateGroup.innerHTML = tickerGroup.innerHTML;
    tickerTrack.style.setProperty('--ticker-duration', `${Math.max(26, tickerGroup.scrollWidth / 45)}s`);
  };

  const scheduleTickerFill = () => {
    cancelAnimationFrame(tickerResizeFrame);
    tickerResizeFrame = requestAnimationFrame(fillTicker);
  };

  window.addEventListener('resize', scheduleTickerFill, { passive: true });
  fillTicker();
  document.fonts?.ready.then(fillTicker);
}

const header = document.querySelector('[data-header]');
let previousScroll = window.scrollY;
window.addEventListener('scroll', () => {
  if (!header || document.body.classList.contains('menu-open')) return;
  const currentScroll = window.scrollY;
  header.classList.toggle('header-hidden', currentScroll > previousScroll && currentScroll > 180);
  previousScroll = currentScroll;
}, { passive: true });

const screenMarquee = document.querySelector('[data-screen-marquee]');

if (screenMarquee) {
  const track = screenMarquee.querySelector('.vtb-quick-screens');
  const originals = Array.from(track.children);
  const originalCount = originals.length;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let offset = 0;
  let cycleWidth = 0;
  let lastFrame = performance.now();
  let lastPointerX = 0;
  let isDragging = false;
  let isVisible = true;

  originals.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  const normalizeOffset = () => {
    if (!cycleWidth) return;
    while (offset <= -cycleWidth) offset += cycleWidth;
    while (offset > 0) offset -= cycleWidth;
  };

  const render = () => {
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
  };

  const measure = () => {
    const firstClone = track.children[originalCount];
    cycleWidth = firstClone ? firstClone.offsetLeft - track.children[0].offsetLeft : 0;
    normalizeOffset();
    render();
  };

  const stopDragging = (event) => {
    if (!isDragging) return;
    isDragging = false;
    screenMarquee.classList.remove('is-dragging');
    if (event && screenMarquee.hasPointerCapture(event.pointerId)) {
      screenMarquee.releasePointerCapture(event.pointerId);
    }
    lastFrame = performance.now();
  };

  screenMarquee.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    isDragging = true;
    lastPointerX = event.clientX;
    screenMarquee.classList.add('is-dragging');
    screenMarquee.setPointerCapture(event.pointerId);
  });

  screenMarquee.addEventListener('pointermove', (event) => {
    if (!isDragging) return;
    offset += event.clientX - lastPointerX;
    lastPointerX = event.clientX;
    normalizeOffset();
    render();
  });

  screenMarquee.addEventListener('pointerup', stopDragging);
  screenMarquee.addEventListener('pointercancel', stopDragging);

  screenMarquee.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    offset += event.key === 'ArrowLeft' ? 80 : -80;
    normalizeOffset();
    render();
    lastFrame = performance.now();
  });

  if ('IntersectionObserver' in window) {
    const marqueeObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      lastFrame = performance.now();
    });
    marqueeObserver.observe(screenMarquee);
  }

  const animate = (time) => {
    const elapsed = Math.min(time - lastFrame, 40);
    lastFrame = time;
    if (!isDragging && isVisible && !reducedMotion.matches) {
      offset -= elapsed * 0.018;
      normalizeOffset();
      render();
    }
    requestAnimationFrame(animate);
  };

  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure, { once: true });
  measure();
  requestAnimationFrame(animate);
}
