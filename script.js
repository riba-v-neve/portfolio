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

const header = document.querySelector('[data-header]');
let previousScroll = window.scrollY;
window.addEventListener('scroll', () => {
  if (!header || document.body.classList.contains('menu-open')) return;
  const currentScroll = window.scrollY;
  header.classList.toggle('header-hidden', currentScroll > previousScroll && currentScroll > 180);
  previousScroll = currentScroll;
}, { passive: true });
