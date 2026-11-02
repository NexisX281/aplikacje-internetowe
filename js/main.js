/**
 * Zora Labs — Interactive Application Logic (main.js)
 * Custom ES6+ features: Theme Switcher, Mobile Drawer, Exhibition Deck Filter/Search,
 * Cinema Frame Inspector Modal, Studio Throughput Simulator, Smooth Accordion,
 * and Validated Inquiry Form with localStorage draft persistence.
 */
(function () {
  'use strict';

  const STORAGE_THEME_KEY = 'zora_theme_pref';
  const STORAGE_DRAFT_KEY = 'zora_inquiry_draft_v3';

  document.addEventListener('DOMContentLoaded', () => {
    initThemeControls();
    initMobileMenu();
    initAnchorNavigationAndSpy();
    initDeckFilterAndSearch();
    initInspectorModal();
    initThroughputSimulator();
    initSmoothAccordion();
    initContactFormValidation();
  });

  /* 1. Theme Switcher (Onyx / Papier) */
  function initThemeControls() {
    const root = document.documentElement;
    const desktopBtn = document.getElementById('themeToggle');
    const mobileBtn = document.getElementById('themeToggleMobile');
    const label = document.getElementById('themeLabel');

    const applyTheme = (theme) => {
      root.setAttribute('data-theme', theme);
      if (label) label.textContent = theme === 'light' ? 'Papier' : 'Onyx';
      if (window.zoraSceneState) window.zoraSceneState.theme = theme;
    };

    applyTheme(root.getAttribute('data-theme') || 'dark');

    const toggle = () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_THEME_KEY, next);
      } catch (_) {}
    };

    if (desktopBtn) desktopBtn.addEventListener('click', toggle);
    if (mobileBtn) mobileBtn.addEventListener('click', toggle);
  }

  /* 2. Accessible Mobile Drawer */
  function initMobileMenu() {
    const btn = document.getElementById('menuToggle');
    const label = document.getElementById('menuToggleLabel');
    const drawer = document.getElementById('mobileDrawer');
    if (!btn || !drawer) return;

    const setOpen = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
      drawer.classList.toggle('is-open', open);
      if (label) label.textContent = open ? 'Zamknij' : 'Menu';
      document.body.style.overflow = open ? 'hidden' : '';
    };

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    });

    drawer.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });
  }

  /* 3. Pin-Aware Anchor Navigation, ScrollSpy & Back-to-Top */
  function initAnchorNavigationAndSpy() {
    const navItems = Array.from(document.querySelectorAll('.nav-item[data-nav]'));
    const trackedSections = navItems
      .map((item) => document.getElementById(item.getAttribute('data-nav')))
      .filter(Boolean);

    if (trackedSections.length && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id;
              navItems.forEach((link) => {
                link.classList.toggle('is-active', link.getAttribute('data-nav') === id);
              });
            }
          });
        },
        { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
      );
      trackedSections.forEach((sec) => observer.observe(sec));
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();

        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        const y = href === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - 20;

        if (window.zoraLenis) {
          window.zoraLenis.scrollTo(y);
        } else {
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
        history.pushState(null, '', href);
      });
    });

    const backTop = document.getElementById('backToTop');
    if (backTop) {
      backTop.addEventListener('click', () => {
        if (window.zoraLenis) window.zoraLenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* 4. Exhibition Deck Category Filter & Live Search */
  function initDeckFilterAndSearch() {
    const filterBtns = Array.from(document.querySelectorAll('.deck-filter[data-filter]'));
    const searchInput = document.getElementById('deckSearch');
    const cards = Array.from(document.querySelectorAll('.stack-card'));
    const counter = document.getElementById('deckCounter');
    const emptyMsg = document.getElementById('deckEmpty');

    if (!cards.length) return;

    let currentFilter = 'all';
    let currentQuery = '';

    const runFilter = () => {
      let visible = 0;

      cards.forEach((card) => {
        const cat = card.getAttribute('data-category') || '';
        const kw = (card.getAttribute('data-keywords') || '').toLowerCase();
        const body = card.textContent.toLowerCase();

        const catOk = currentFilter === 'all' || cat === currentFilter;
        const queryOk = !currentQuery || kw.includes(currentQuery) || body.includes(currentQuery);

        const show = catOk && queryOk;
        card.hidden = !show;
        if (show) visible++;
      });

      if (counter) {
        counter.textContent = `AKTYWNE KARTY: 0 0 ${visible} / 0 0 ${cards.length}`;
      }
      if (emptyMsg) {
        emptyMsg.hidden = visible > 0;
      }
      if (typeof window.refreshZoraDeck === 'function') {
        window.refreshZoraDeck();
      }
    };

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentFilter = btn.getAttribute('data-filter') || 'all';
        runFilter();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentQuery = e.target.value.trim().toLowerCase();
        runFilter();
      });
    }
  }

  /* 5. Full-Resolution Cinema Frame Inspector Modal */
  function initInspectorModal() {
    const modal = document.getElementById('inspectorModal');
    const backdrop = document.getElementById('inspectorBackdrop');
    const closeBtn = document.getElementById('inspectorClose');
    const titleEl = document.getElementById('inspectorTitle');
    const metaEl = document.getElementById('inspectorMeta');
    const stageEl = document.getElementById('inspectorBody');

    if (!modal || !stageEl) return;

    let openerEl = null;

    const openFromButton = (btn) => {
      openerEl = btn;
      const type = btn.getAttribute('data-modal-type') || 'video';
      const src = btn.getAttribute('data-modal-src') || '';
      const title = btn.getAttribute('data-modal-title') || 'Podgląd sekwencji';
      const meta = btn.getAttribute('data-modal-meta') || '';

      if (titleEl) titleEl.textContent = title;
      if (metaEl) metaEl.textContent = meta;
      stageEl.innerHTML = '';

      if (type === 'video') {
        const v = document.createElement('video');
        v.src = src;
        v.controls = true;
        v.autoplay = true;
        v.playsInline = true;
        stageEl.appendChild(v);
      } else {
        const img = document.createElement('img');
        img.src = src;
        img.alt = title;
        stageEl.appendChild(img);
      }

      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    };

    const closeModal = () => {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      stageEl.innerHTML = '';
      document.body.style.overflow = '';
      if (openerEl) openerEl.focus();
    };

    document.querySelectorAll('.card-inspect-btn[data-modal-src]').forEach((btn) => {
      btn.addEventListener('click', () => openFromButton(btn));

      // Also allow clicking the card visual showcase directly
      const card = btn.closest('.stack-card');
      const visualCol = card ? card.querySelector('.card-visual-col') : null;
      if (visualCol) {
        visualCol.style.cursor = 'pointer';
        visualCol.addEventListener('click', () => openFromButton(btn));
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  /* 6. Interactive Studio Throughput Simulator */
  function initThroughputSimulator() {
    const slider = document.getElementById('durationRange');
    const readout = document.getElementById('durationOutput');
    const ratioChips = Array.from(document.querySelectorAll('.ratio-chip[data-ratio]'));
    const estClips = document.getElementById('estClips');
    const estCompute = document.getElementById('estCompute');
    const estSaved = document.getElementById('estSaved');

    if (!slider) return;

    const updateMetrics = () => {
      const mins = parseInt(slider.value, 10) || 90;
      if (readout) readout.textContent = `${mins} min`;

      const activeFormats = ratioChips.filter((c) => c.classList.contains('is-selected')).length || 1;
      const minClips = Math.max(3, Math.round((mins / 6.5) * 0.9));
      const maxClips = Math.max(minClips + 2, Math.round((mins / 5) * 1.05));
      const renderMins = Math.max(1.0, mins * 0.042 + activeFormats * 0.35).toFixed(1);
      const savedHrs = ((mins / 15) * (1.25 + activeFormats * 0.45)).toFixed(1);

      if (estClips) estClips.textContent = `${minClips} – ${maxClips}`;
      if (estCompute) estCompute.textContent = `~${renderMins} min`;
      if (estSaved) estSaved.textContent = `${savedHrs} godz.`;
    };

    slider.addEventListener('input', updateMetrics);

    ratioChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const selected = ratioChips.filter((c) => c.classList.contains('is-selected')).length;
        const isOn = chip.classList.contains('is-selected');
        if (isOn && selected <= 1) return;

        chip.classList.toggle('is-selected', !isOn);
        chip.setAttribute('aria-pressed', String(!isOn));
        updateMetrics();
      });
    });

    updateMetrics();
  }

  /* 7. Smooth GSAP-Animated Technical Accordion */
  function initSmoothAccordion() {
    const triggers = document.querySelectorAll('#specAccordion .faq-trigger');
    triggers.forEach((btn) => {
      btn.addEventListener('click', () => {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        const panelId = btn.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        const item = btn.closest('.faq-item');

        btn.setAttribute('aria-expanded', String(!isExpanded));
        if (item) item.classList.toggle('is-open', !isExpanded);

        if (!panel) return;

        if (typeof window.gsap !== 'undefined') {
          const gsap = window.gsap;
          if (!isExpanded) {
            panel.hidden = false;
            gsap.fromTo(
              panel,
              { height: 0, opacity: 0 },
              {
                height: 'auto',
                opacity: 1,
                duration: 0.42,
                ease: 'power3.out',
                onComplete: () => {
                  if (window.ScrollTrigger) window.ScrollTrigger.refresh();
                }
              }
            );
          } else {
            gsap.to(panel, {
              height: 0,
              opacity: 0,
              duration: 0.32,
              ease: 'power2.inOut',
              onComplete: () => {
                panel.hidden = true;
                panel.style.height = '';
                if (window.ScrollTrigger) window.ScrollTrigger.refresh();
              }
            });
          }
        } else {
          panel.hidden = isExpanded;
        }
      });
    });
  }

  /* 8. Contact Form Validation & LocalStorage Draft Persistence */
  function initContactFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const nameEl = document.getElementById('senderName');
    const emailEl = document.getElementById('senderEmail');
    const wfEl = document.getElementById('workflowType');
    const msgEl = document.getElementById('senderMessage');
    const draftEl = document.getElementById('draftStatus');
    const feedbackEl = document.getElementById('formFeedback');

    try {
      const raw = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (nameEl && d.name) nameEl.value = d.name;
        if (emailEl && d.email) emailEl.value = d.email;
        if (wfEl && d.wf) wfEl.value = d.wf;
        if (msgEl && d.msg) msgEl.value = d.msg;
        if (draftEl) draftEl.textContent = 'Przywrócono zapisany szkic';
      }
    } catch (_) {}

    const persistDraft = () => {
      try {
        localStorage.setItem(
          STORAGE_DRAFT_KEY,
          JSON.stringify({
            name: nameEl ? nameEl.value : '',
            email: emailEl ? emailEl.value : '',
            wf: wfEl ? wfEl.value : '',
            msg: msgEl ? msgEl.value : ''
          })
        );
        if (draftEl) draftEl.textContent = 'Zapisano szkic w przeglądarce';
      } catch (_) {}
    };

    [nameEl, emailEl, wfEl, msgEl].forEach((field) => {
      if (!field) return;
      field.addEventListener('input', () => {
        field.classList.remove('is-invalid');
        const errId = field.getAttribute('aria-describedby');
        const errNode = errId ? document.getElementById(errId) : null;
        if (errNode) errNode.textContent = '';
        persistDraft();
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const flagError = (field, errId, text) => {
        if (field) field.classList.add('is-invalid');
        const node = document.getElementById(errId);
        if (node) node.textContent = text;
        valid = false;
      };

      if (!nameEl || nameEl.value.trim().length < 2) {
        flagError(nameEl, 'nameError', 'Podaj imię i nazwisko lub nazwę redakcji (min. 2 znaki).');
      }

      const emailOk = emailEl && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailEl.value.trim());
      if (!emailOk) {
        flagError(emailEl, 'emailError', 'Wprowadź poprawny służbowy adres e-mail.');
      }

      if (!wfEl || !wfEl.value) {
        flagError(wfEl, 'workflowError', 'Wybierz główny format materiałów wideo.');
      }

      if (!msgEl || msgEl.value.trim().length < 15) {
        flagError(msgEl, 'messageError', 'Opisz krótko wolumen nagrań i oczekiwania (min. 15 znaków).');
      }

      if (!valid) {
        if (feedbackEl) feedbackEl.hidden = true;
        return;
      }

      if (feedbackEl) {
        feedbackEl.hidden = false;
        feedbackEl.textContent = `Dziękujemy, ${nameEl.value.trim()}. Specyfikacja została zarejestrowana — zespół inżynieryjny Zora Labs skontaktuje się w ciągu 24 godzin.`;
      }

      form.reset();
      try {
        localStorage.removeItem(STORAGE_DRAFT_KEY);
      } catch (_) {}
      if (draftEl) draftEl.textContent = 'Specyfikacja wysłana';
    });
  }
})();
