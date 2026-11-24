(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const KEY = 'theme';

  const apply = (mode) => {
    if (mode) root.dataset.theme = mode; else delete root.dataset.theme;
    toggle.setAttribute('aria-pressed', String(mode === 'dark'));
  };

  try { apply(localStorage.getItem(KEY)); } catch {}

  toggle.addEventListener('click', () => {
    const dark = root.dataset.theme === 'dark'
      || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    const next = dark ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem(KEY, next); } catch {}
  });

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
    sweep();
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  // sections skipped by an anchor jump or a restored scroll position
  const sweep = () => {
    for (const el of items) {
      if (el.classList.contains('is-visible')) continue;
      if (el.getBoundingClientRect().top < innerHeight) {
        el.classList.add('is-visible');
        io.unobserve(el);
      }
    }
  };

  items.forEach((el) => io.observe(el));
  sweep();
  items.forEach((el) => io.observe(el));
})();
