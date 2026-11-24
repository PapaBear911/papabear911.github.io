(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const KEY = 'theme';

  const apply = (mode) => {
    if (mode) root.dataset.theme = mode; else delete root.dataset.theme;
    if (toggle) toggle.setAttribute('aria-pressed', String(mode === 'dark'));
  };

  try { apply(localStorage.getItem(KEY)); } catch {}

  if (toggle) {
    toggle.addEventListener('click', () => {
      const dark = root.dataset.theme === 'dark'
        || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
      const next = dark ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch {}
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Reveal observer
  const items = document.querySelectorAll('.reveal');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reducedMotion) {
    items.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
      sweep();
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

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
  }

  // Scroll depth tracking & parallax
  const scrollFill = document.getElementById('scrollFill');
  const pMatrix = document.getElementById('pMatrix');
  let currentScrollY = window.scrollY || window.pageYOffset || 0;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      currentScrollY = window.scrollY || window.pageYOffset || 0;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (currentScrollY / docHeight) * 100)) : 0;
      if (scrollFill) scrollFill.style.width = pct + '%';

      if (!reducedMotion && pMatrix) {
        pMatrix.style.transform = 'translate3d(0, ' + ((currentScrollY * 0.08) % 32) + 'px, 0)';
      }

      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Cursor spotlight in hero (GPU-composited transform)
  const hero = document.getElementById('top');
  const spotlight = document.getElementById('cursorSpotlight');
  if (hero && spotlight && matchMedia('(pointer: fine)').matches && !reducedMotion) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotlight.style.opacity = '1';
      spotlight.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) translate(-50%, -50%)';
    });
    hero.addEventListener('mouseleave', () => {
      spotlight.style.opacity = '0';
    });
  }

  // Network nodes canvas background
  const canvas = document.getElementById('networkCanvas');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes = [];
    let packets = [];
    let pointer = { x: -9999, y: -9999, active: false };
    let palette = { accent: '', glow: '', line: '' };
    let rafId = 0;

    const readPalette = () => {
      const cs = getComputedStyle(root);
      palette.accent = cs.getPropertyValue('--accent').trim();
      palette.glow = cs.getPropertyValue('--accent-glow').trim();
      palette.line = cs.getPropertyValue('--vector-line').trim();
    };

    const initNodes = () => {
      const count = Math.min(36, Math.max(16, Math.floor((width * height) / 38000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: i % 5 === 0 ? 3 : 2,
        phase: Math.random() * Math.PI * 2,
        alt: i % 3 === 0
      }));
      packets = Array.from({ length: Math.min(5, Math.floor(count / 6)) }, () => ({
        a: 0, b: 1, t: Math.random(), speed: 0.004 + Math.random() * 0.004
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
      if (reducedMotion) drawFrame(0);
    };

    const drawFrame = (time) => {
      ctx.clearRect(0, 0, width, height);
      const maxDist = Math.min(190, Math.max(120, width * 0.16));
      const parallaxOffset = reducedMotion ? 0 : (currentScrollY * 0.14) % height;

      const pos = nodes.map((n) => {
        let py = (n.y - parallaxOffset) % height;
        if (py < 0) py += height;
        return { x: n.x, y: py, r: n.r, phase: n.phase, alt: n.alt };
      });

      // Edges
      ctx.lineWidth = 1;
      const activeEdges = [];
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[i].x - pos[j].x;
          const dy = pos[i].y - pos[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.55;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = palette.line;
            ctx.beginPath();
            ctx.moveTo(pos[i].x, pos[i].y);
            ctx.lineTo(pos[j].x, pos[j].y);
            ctx.stroke();
            if (dist < maxDist * 0.85) activeEdges.push([i, j]);
          }
        }
      }

      // Traveling data packets
      if (!reducedMotion && activeEdges.length > 0) {
        for (const p of packets) {
          p.t += p.speed;
          if (p.t >= 1 || p.a >= pos.length || p.b >= pos.length) {
            const edge = activeEdges[Math.floor(Math.random() * activeEdges.length)];
            p.a = edge[0];
            p.b = edge[1];
            p.t = 0;
          }
          const na = pos[p.a];
          const nb = pos[p.b];
          if (Math.hypot(na.x - nb.x, na.y - nb.y) < maxDist) {
            const px = na.x + (nb.x - na.x) * p.t;
            const py = na.y + (nb.y - na.y) * p.t;
            ctx.globalAlpha = 0.75;
            ctx.fillStyle = palette.glow;
            ctx.beginPath();
            ctx.arc(px, py, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Nodes + subtle glow
      for (const n of pos) {
        const pulse = reducedMotion ? 0.7 : 0.55 + 0.35 * Math.sin(time * 0.0015 + n.phase);
        let boost = 0;
        if (pointer.active) {
          const pd = Math.hypot(n.x - pointer.x, n.y - pointer.y);
          if (pd < 160) boost = (1 - pd / 160) * 0.45;
        }
        const color = n.alt ? palette.glow : palette.accent;

        ctx.globalAlpha = Math.min(0.28, (pulse + boost) * 0.22);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = Math.min(0.9, pulse + boost);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const tick = (time) => {
      if (!document.hidden) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0) n.x += width;
          if (n.x > width) n.x -= width;
          if (n.y < 0) n.y += height;
          if (n.y > height) n.y -= height;
        }
        drawFrame(time);
      }
      rafId = requestAnimationFrame(tick);
    };

    if (matchMedia('(pointer: fine)').matches && !reducedMotion) {
      window.addEventListener('mousemove', (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.active = true;
      }, { passive: true });
      document.addEventListener('mouseleave', () => { pointer.active = false; });
    }

    if (toggle) {
      toggle.addEventListener('click', () => requestAnimationFrame(() => {
        readPalette();
        if (reducedMotion) drawFrame(0);
      }));
    }
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      readPalette();
      if (reducedMotion) drawFrame(0);
    });

    window.addEventListener('resize', resize, { passive: true });
    readPalette();
    resize();
    if (!reducedMotion) {
      rafId = requestAnimationFrame(tick);
    }
  }

  // Project preview modal controller
  const modal = document.getElementById('projectModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalActionClose = document.getElementById('modalActionClose');
  const modalActionOpen = document.getElementById('modalActionOpen');
  const modalTitle = document.getElementById('modalProjectTitle');
  const modalBadge = document.getElementById('modalProjectBadge');
  const modalBody = document.getElementById('modalBody');
  const modalUrl = document.getElementById('modalProjectUrl');

  let lastActiveElement = null;

  const isLandscapeTabletOrDesktop = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return w >= 1024 || (w >= 768 && w > h && Math.min(w, h) >= 600);
  };

  const closeModal = () => {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (modalBody) modalBody.innerHTML = '';
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
    lastActiveElement = null;
  };

  const canEmbed = (urlStr) => {
    try {
      const u = new URL(urlStr, window.location.href);
      const blocked = [
        'github.com',
        'gist.github.com',
        'raw.githubusercontent.com',
        'twitter.com',
        'x.com',
        'linkedin.com',
        'facebook.com'
      ];
      if (blocked.some((h) => u.hostname === h || u.hostname.endsWith('.' + h))) {
        return false;
      }
      return false;
    } catch {
      return false;
    }
  };

  const openModal = (data, triggerEl) => {
    if (!modal) return;
    lastActiveElement = triggerEl;

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalBadge) {
      modalBadge.textContent = data.badge;
      modalBadge.style.display = data.badge ? 'inline-block' : 'none';
    }
    if (modalUrl) modalUrl.textContent = data.url;
    if (modalActionOpen) modalActionOpen.href = data.url;

    if (modalBody) {
      modalBody.innerHTML = '';
      if (data.canEmbed) {
        const iframe = document.createElement('iframe');
        iframe.className = 'modal-iframe';
        iframe.src = data.url;
        iframe.title = data.title + ' preview';
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
        modalBody.appendChild(iframe);
      } else {
        const fallback = document.createElement('div');
        fallback.className = 'modal-fallback-preview';
        fallback.innerHTML = `
          <div class="modal-fallback-notice">
            <svg class="notice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <div class="notice-head">Direct embedding restricted</div>
              <p>This destination (${data.host}) restricts in-frame embedding via security policy. You can preview the project details below and open the live project in a new tab.</p>
            </div>
          </div>
          <div class="modal-preview-summary">
            <p class="modal-summary-desc">${data.desc}</p>
            <div class="meta">${data.tagsHtml}</div>
          </div>
        `;
        modalBody.appendChild(fallback);
      }
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    if (modalCloseBtn) modalCloseBtn.focus();
  };

  const workList = document.querySelector('.work-list');
  if (workList) {
    workList.addEventListener('click', (e) => {
      const card = e.target.closest('a.work-item');
      if (!card || !card.href) return;

      if (!isLandscapeTabletOrDesktop()) return;

      e.preventDefault();

      const titleEl = card.querySelector('h3');
      const title = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : 'Project preview';
      const badgeEl = card.querySelector('.badge');
      const badge = badgeEl ? badgeEl.textContent.trim() : '';
      const descEl = card.querySelector('p');
      const desc = descEl ? descEl.textContent.trim() : '';
      const metaEl = card.querySelector('.meta');
      const tagsHtml = metaEl ? metaEl.innerHTML : '';
      let host = '';
      try { host = new URL(card.href).hostname; } catch {}

      openModal({
        url: card.href,
        title,
        badge,
        desc,
        tagsHtml,
        host,
        canEmbed: canEmbed(card.href)
      }, card);
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target === modalBackdrop) closeModal();
    });
  }
  if (modalActionClose) modalActionClose.addEventListener('click', closeModal);

  if (modalActionOpen) {
    modalActionOpen.addEventListener('click', () => {
      closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (!modal || !modal.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = modal.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
