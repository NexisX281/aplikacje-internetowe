/**
 * Zora Labs — Master Scrollytelling Choreography (animations.js)
 * Coordinates Lenis Smooth Scroll + GSAP + ScrollTrigger + WebGL State across all 6 Acts.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isAutomated =
      navigator.webdriver === true || window.location.search.indexOf('skipIntro=1') !== -1;

    if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    initPreloader(prefersReducedMotion || isAutomated);
    initLenisAndHUD(prefersReducedMotion);
    initMagneticCursor(prefersReducedMotion);

    if (!prefersReducedMotion && typeof window.gsap !== 'undefined') {
      initHeroScrollytelling();
      initManifestoAndPortal();
      initStackingDeck();
      initHorizontalPipeline();
      initVelocityMarqueeAndReveals();
    } else {
      // Ensure full visibility when reduced motion is requested
      document.querySelectorAll('.scrub-word, .cinema-aperture, .spatial-chapter').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      document.querySelectorAll('.draw-border-top').forEach((el) => (el.style.transform = 'scaleX(1)'));
      document.querySelectorAll('.draw-border-right').forEach((el) => (el.style.transform = 'scaleY(1)'));
    }
  });

  /* ==========================================================================
     1. STUDIO SHUTTER PRELOADER (000 -> 100)
     ========================================================================== */
  function initPreloader(skipFast) {
    const preloader = document.getElementById('preloader');
    const numEl = document.getElementById('preloaderNum');
    const fillEl = document.getElementById('preloaderFill');
    const statusEl = document.getElementById('preloaderStatus');

    if (!preloader) return;

    const alreadySeen = (() => {
      try {
        return sessionStorage.getItem('zora_shutter_seen') === '1';
      } catch (_) {
        return false;
      }
    })();

    if (skipFast || alreadySeen || typeof window.gsap === 'undefined') {
      preloader.classList.add('is-done');
      return;
    }

    try {
      sessionStorage.setItem('zora_shutter_seen', '1');
    } catch (_) {}

    const gsap = window.gsap;
    const counter = { val: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        preloader.classList.add('is-done');
      }
    });

    gsap.set('[data-hero-line]', { yPercent: 115 });
    gsap.set('[data-hero-intro]', { opacity: 0, y: 16 });

    tl.to(counter, {
      val: 100,
      duration: 0.85,
      ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(counter.val);
        if (numEl) numEl.textContent = String(v).padStart(3, '0');
        if (fillEl) fillEl.style.transform = `scaleX(${v / 100})`;
        if (statusEl && v > 60) statusEl.textContent = 'GOTOWOŚĆ STRUMIENIA';
      }
    })
      .to('.preloader-hud', { opacity: 0, y: -12, duration: 0.25, ease: 'power2.in' })
      .to('.shutter-top', { yPercent: -102, duration: 0.72, ease: 'expo.inOut' }, '-=0.08')
      .to('.shutter-bottom', { yPercent: 102, duration: 0.72, ease: 'expo.inOut' }, '<')
      .to(
        '[data-hero-line]',
        { yPercent: 0, duration: 0.85, stagger: 0.09, ease: 'expo.out' },
        '-=0.45'
      )
      .to(
        '[data-hero-intro]',
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: 'power3.out' },
        '-=0.65'
      );
  }

  /* ==========================================================================
     2. LENIS SMOOTH SCROLL + LIVE BROADCAST TIMECODE & RULER
     ========================================================================== */
  function initLenisAndHUD(prefersReducedMotion) {
    const rulerFill = document.getElementById('rulerFill');
    const rulerPct = document.getElementById('rulerPct');
    const tcEl = document.getElementById('globalTimecode');

    const updateGlobalHUD = (scrollY, velocity) => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, scrollY / maxScroll));

      if (window.zoraSceneState) {
        window.zoraSceneState.globalProgress = progress;
        window.zoraSceneState.velocity = velocity;
      }

      if (rulerFill) rulerFill.style.transform = `scaleY(${progress.toFixed(3)})`;
      if (rulerPct) rulerPct.textContent = `${String(Math.round(progress * 100)).padStart(2, '0')}%`;

      if (tcEl) {
        // Map 0..1 scroll to a 01:14:22:18 studio broadcast recording
        const totalFrames = Math.round(progress * (4462 * 24 + 18));
        const ff = totalFrames % 24;
        const totalSec = Math.floor(totalFrames / 24);
        const ss = totalSec % 60;
        const mm = Math.floor(totalSec / 60) % 60;
        const hh = Math.floor(totalSec / 3600);
        tcEl.textContent =
          `TC ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:` +
          `${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}`;
      }
    };

    if (!prefersReducedMotion && typeof window.Lenis !== 'undefined') {
      try {
        const lenis = new window.Lenis({
          duration: 1.15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true
        });
        window.zoraLenis = lenis;

        lenis.on('scroll', (e) => {
          updateGlobalHUD(e.scroll, e.velocity || 0);
          if (window.ScrollTrigger) window.ScrollTrigger.update();
        });

        if (window.gsap) {
          window.gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
          });
          window.gsap.ticker.lagSmoothing(0);
        }
        return;
      } catch (_) {}
    }

    window.addEventListener(
      'scroll',
      () => updateGlobalHUD(window.scrollY || window.pageYOffset, 0),
      { passive: true }
    );
    updateGlobalHUD(window.scrollY || 0, 0);
  }

  /* ==========================================================================
     3. CUSTOM MAGNETIC PRECISION CURSOR & BUTTON PULL
     ========================================================================== */
  function initMagneticCursor(prefersReducedMotion) {
    if (prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;

    const lens = document.getElementById('cursorLens');
    const lensText = document.getElementById('cursorLensText');
    if (!lens) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;

    window.addEventListener(
      'mousemove',
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        lens.classList.add('is-visible');
      },
      { passive: true }
    );

    const renderCursor = () => {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      lens.style.left = `${curX}px`;
      lens.style.top = `${curY}px`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Expand cursor on interactive video/showcase zones
    document.querySelectorAll('[data-cursor]').forEach((zone) => {
      zone.addEventListener('mouseenter', () => {
        if (lensText) lensText.textContent = zone.getAttribute('data-cursor') || 'ZBADAJ';
        lens.classList.add('is-expanded');
      });
      zone.addEventListener('mouseleave', () => {
        lens.classList.remove('is-expanded');
      });
    });

    // Subtle magnetic pull on CTA buttons
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
        btn.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ==========================================================================
     4. ACT I: PINNED 5-STAGE 3D + CINEMA APERTURE SCROLLYTELLING (#proces)
     ========================================================================== */
  function initHeroScrollytelling() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const mm = gsap.matchMedia();

    mm.add('(min-width: 961px)', () => {
      const stage = document.getElementById('heroPinStage');
      const opening = document.getElementById('heroOpening');
      const aperture = document.getElementById('cinemaAperture');
      const apWide = document.getElementById('apertureWide');
      const apVert = document.getElementById('apertureVert');
      const apCrop = document.getElementById('apCropGuide');
      const apModeChip = document.getElementById('apModeChip');
      const apFrameChip = document.getElementById('apFrameChip');
      const stageReadout = document.getElementById('heroStageReadout');
      const stepPills = Array.from(document.querySelectorAll('.step-pill[data-hero-step]'));

      const ch1 = document.getElementById('heroCh1');
      const ch2 = document.getElementById('heroCh2');
      const ch3 = document.getElementById('heroCh3');
      const ch4 = document.getElementById('heroCh4');

      if (!stage || !aperture) return;

      const STAGE_NAMES = [
        'ETAP 00 / INICJACJA 3D',
        'ETAP 01 / ROZBIÓR STRUMIENIA',
        'ETAP 02 / SELEKCJA SEMANTYCZNA',
        'ETAP 03 / TRANSFORMACJA 9:16',
        'ETAP 04 / MASTER EMISYJNY'
      ];

      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'zoraHeroPin',
          trigger: stage,
          start: 'top top',
          end: '+=3800',
          pin: true,
          scrub: 0.55,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            if (window.zoraSceneState) {
              window.zoraSceneState.heroProgress = p;
            }
            if (apFrameChip) {
              apFrameChip.textContent = `FRM ${String(Math.max(1, Math.round(p * 960))).padStart(4, '0')}`;
            }

            let stepIdx = 0;
            if (p >= 0.78) stepIdx = 4;
            else if (p >= 0.54) stepIdx = 3;
            else if (p >= 0.30) stepIdx = 2;
            else if (p >= 0.08) stepIdx = 1;

            if (stageReadout) stageReadout.textContent = STAGE_NAMES[stepIdx];
            if (apModeChip) {
              apModeChip.textContent =
                stepIdx >= 3 ? 'MASTER // 9:16 VERTICAL 60FPS' : 'RAW // 16:9 STUDIO STREAM';
            }
            stepPills.forEach((pill, i) => pill.classList.toggle('is-active', i === stepIdx));
          }
        }
      });

      // Stage 0 -> 1: Opening dissolves into Z-space, Cinema Aperture opens in 16:9 + Chapter 01
      tl.to(opening, { opacity: 0, scale: 0.9, y: -36, duration: 1.0, ease: 'power2.inOut' }, 0)
        .to(aperture, { opacity: 1, scale: 1, duration: 1.15, ease: 'power3.out' }, 0.35)
        .to(ch1, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, 0.7)
        // Stage 1 -> 2: Semantic crop tightens + Chapter 02
        .to(ch1, { opacity: 0, y: -26, duration: 0.65, ease: 'power2.in' }, 2.1)
        .to(apCrop, { width: '28%', borderColor: '#f6a113', duration: 0.9, ease: 'power2.inOut' }, 2.15)
        .to(aperture, { scale: 0.95, duration: 0.9, ease: 'power2.inOut' }, 2.15)
        .to(ch2, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, 2.45)
        // Stage 2 -> 3: Physical geometry morph from 16:9 wide into 9:16 vertical monolith!
        .to(ch2, { opacity: 0, y: -26, duration: 0.65, ease: 'power2.in' }, 3.85)
        .to(
          aperture,
          {
            width: '312px',
            height: '554px',
            borderRadius: '18px',
            scale: 1,
            borderColor: 'rgba(230, 54, 33, 0.65)',
            duration: 1.35,
            ease: 'power3.inOut'
          },
          3.95
        )
        .to(apWide, { opacity: 0, duration: 0.95, ease: 'power2.inOut' }, 4.15)
        .to(apVert, { opacity: 1, duration: 0.95, ease: 'power2.inOut' }, 4.15)
        .to(apCrop, { width: '88%', opacity: 0.35, duration: 1.1 }, 4.0)
        .to(ch3, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, 4.4)
        // Stage 3 -> 4: Final broadcast lock + Chapter 04
        .to(ch3, { opacity: 0, y: -26, duration: 0.65, ease: 'power2.in' }, 5.8)
        .to(
          aperture,
          {
            scale: 1.04,
            borderColor: 'rgba(246, 161, 19, 0.75)',
            duration: 0.95,
            ease: 'power2.out'
          },
          5.95
        )
        .to(ch4, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, 6.1)
        .to({}, { duration: 0.85 });

      const STEP_OFFSETS = [0, 0.18, 0.41, 0.68, 0.93];
      stepPills.forEach((pill) => {
        pill.addEventListener('click', () => {
          const st = ScrollTrigger.getById('zoraHeroPin');
          if (!st) return;
          const idx = parseInt(pill.getAttribute('data-hero-step'), 10) || 0;
          const y = st.start + (st.end - st.start) * (STEP_OFFSETS[idx] || 0);
          if (window.zoraLenis) window.zoraLenis.scrollTo(y);
          else window.scrollTo({ top: y, behavior: 'smooth' });
        });
      });
    });
  }

  /* ==========================================================================
     5. ACT II: WORD-SCRUB MANIFESTO + PARALLAX SHARDS + PORTAL CURTAIN
     ========================================================================== */
  function initManifestoAndPortal() {
    const gsap = window.gsap;

    // Split manifesto into word spans for scroll-scrubbed reading illumination
    const manifesto = document.getElementById('scrubManifesto');
    if (manifesto) {
      const words = manifesto.textContent.trim().split(/\s+/);
      manifesto.innerHTML = words
        .map((w) => `<span class="scrub-word">${w}</span>`)
        .join(' ');

      const wordEls = manifesto.querySelectorAll('.scrub-word');
      gsap.to(wordEls, {
        opacity: 1,
        stagger: 0.06,
        ease: 'none',
        scrollTrigger: {
          trigger: manifesto,
          start: 'top 80%',
          end: 'bottom 38%',
          scrub: 0.4
        }
      });
    }

    // Multi-speed floating parallax studio shards
    document.querySelectorAll('[data-parallax]').forEach((shard) => {
      const speed = parseFloat(shard.getAttribute('data-parallax')) || -80;
      gsap.fromTo(
        shard,
        { y: -speed, rotate: speed > 0 ? -2.5 : 2.5 },
        {
          y: speed,
          rotate: speed > 0 ? 2.5 : -2.5,
          ease: 'none',
          scrollTrigger: {
            trigger: '.manifest-text-stage',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    });

    // Expanding Fullscreen Video Portal Curtain
    const portalWrap = document.getElementById('portalPinWrap');
    const portalWin = document.getElementById('portalWindow');
    const portalVid = portalWin ? portalWin.querySelector('.portal-video') : null;

    if (portalWrap && portalWin) {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 961px)', () => {
        const pTl = gsap.timeline({
          scrollTrigger: {
            trigger: portalWrap,
            start: 'top top',
            end: '+=1300',
            pin: true,
            scrub: 0.5,
            anticipatePin: 1
          }
        });

        pTl.to(
          portalWin,
          {
            clipPath: 'inset(0% 0% 0% 0% round 0px)',
            ease: 'power2.inOut',
            duration: 1
          },
          0
        );

        if (portalVid) {
          pTl.to(portalVid, { scale: 1, ease: 'power2.out', duration: 1 }, 0);
        }
      });

      mm.add('(max-width: 960px)', () => {
        gsap.to(portalWin, {
          clipPath: 'inset(0% 0% 0% 0% round 8px)',
          scrollTrigger: {
            trigger: portalWrap,
            start: 'top 80%',
            end: 'top 25%',
            scrub: true
          }
        });
      });
    }
  }

  /* ==========================================================================
     6. ACT III: 3D STACKING EXHIBITION CARD DECK (#archiwum)
     ========================================================================== */
  function initStackingDeck() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    let deckTriggers = [];

    const buildDeck = () => {
      deckTriggers.forEach((t) => t.kill());
      deckTriggers = [];

      if (window.innerWidth < 961) return;

      const visibleCards = Array.from(document.querySelectorAll('.stack-card')).filter(
        (c) => !c.hidden
      );

      visibleCards.forEach((card, index) => {
        gsap.set(card, { scale: 1, opacity: 1, rotateX: 0 });
        if (index === visibleCards.length - 1) return; // Last card stays at full scale

        const nextCard = visibleCards[index + 1];
        const tween = gsap.to(card, {
          scale: 0.91,
          opacity: 0.42,
          rotateX: 3.5,
          ease: 'none',
          scrollTrigger: {
            trigger: nextCard,
            start: 'top 88%',
            end: 'top 16%',
            scrub: true
          }
        });

        if (tween.scrollTrigger) deckTriggers.push(tween.scrollTrigger);
      });
    };

    buildDeck();
    window.refreshZoraDeck = () => {
      buildDeck();
      ScrollTrigger.refresh();
    };
  }

  /* ==========================================================================
     7. ACT IV: PINNED HORIZONTAL SCROLL STUDIO PIPELINE (#system)
     ========================================================================== */
  function initHorizontalPipeline() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    const pinWrap = document.getElementById('horizontalPinWrap');
    const track = document.getElementById('horizontalTrack');
    const signalLine = document.getElementById('horizSignalLine');
    const stageBtns = Array.from(document.querySelectorAll('.h-stage-btn[data-h-index]'));
    const panels = Array.from(document.querySelectorAll('.h-panel'));

    if (!pinWrap || !track || !panels.length) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 961px)', () => {
      const getMaxX = () => {
        const viewportW = pinWrap.clientWidth - parseFloat(getComputedStyle(track.parentElement).paddingLeft) * 2;
        return Math.max(0, track.scrollWidth - viewportW);
      };

      const hTween = gsap.to(track, {
        x: () => -getMaxX(),
        ease: 'none',
        scrollTrigger: {
          id: 'zoraHorizPin',
          trigger: pinWrap,
          start: 'top top',
          end: () => `+=${Math.max(2200, getMaxX() * 1.15)}`,
          pin: true,
          scrub: 0.55,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            if (window.zoraSceneState) {
              window.zoraSceneState.horizontalProgress = p;
            }
            if (signalLine) {
              signalLine.style.strokeDashoffset = String(1000 * (1 - p));
            }
            const activeIdx = Math.min(panels.length - 1, Math.round(p * (panels.length - 1)));
            stageBtns.forEach((btn, i) => btn.classList.toggle('is-active', i === activeIdx));
          }
        }
      });

      // Internal horizontal parallax on each panel screenshot
      panels.forEach((panel) => {
        const img = panel.querySelector('.h-parallax-img');
        if (!img) return;
        gsap.fromTo(
          img,
          { xPercent: -5 },
          {
            xPercent: 5,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: hTween,
              start: 'left right',
              end: 'right left',
              scrub: true
            }
          }
        );
      });

      // Click stage pills to glide directly to that horizontal stop
      stageBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const st = ScrollTrigger.getById('zoraHorizPin');
          if (!st) return;
          const idx = parseInt(btn.getAttribute('data-h-index'), 10) || 0;
          const ratio = idx / Math.max(1, panels.length - 1);
          const targetY = st.start + (st.end - st.start) * ratio;
          if (window.zoraLenis) window.zoraLenis.scrollTo(targetY);
          else window.scrollTo({ top: targetY, behavior: 'smooth' });
        });
      });
    });

    // Mobile horizontal scroll button jump
    mm.add('(max-width: 960px)', () => {
      const viewport = track.parentElement;
      stageBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-h-index'), 10) || 0;
          const panel = panels[idx];
          if (panel && viewport) {
            viewport.scrollTo({ left: panel.offsetLeft - 20, behavior: 'smooth' });
            stageBtns.forEach((b, i) => b.classList.toggle('is-active', i === idx));
          }
        });
      });
    });
  }

  /* ==========================================================================
     8. VELOCITY MARQUEE, SELF-DRAWING SWISS GRID & SECTION REVEALS
     ========================================================================== */
  function initVelocityMarqueeAndReveals() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    // Velocity-reactive infinite marquee
    const marquee = document.getElementById('marqueeRow1');
    if (marquee) {
      let xPos = 0;
      let direction = -1;

      gsap.ticker.add(() => {
        const vel = window.zoraSceneState ? window.zoraSceneState.velocity : 0;
        if (Math.abs(vel) > 0.5) {
          direction = vel > 0 ? -1 : 1;
        }
        const boost = Math.min(Math.abs(vel) * 0.08, 4.5);
        xPos += direction * (0.45 + boost);

        const halfWidth = marquee.scrollWidth / 2;
        if (xPos <= -halfWidth) xPos += halfWidth;
        if (xPos > 0) xPos -= halfWidth;

        marquee.style.transform = `translate3d(${xPos.toFixed(1)}px, 0, 0)`;
      });
    }

    // Self-drawing Swiss architectural borders + numeral counters
    const swissGrid = document.getElementById('swissGrid');
    if (swissGrid) {
      gsap.to(swissGrid.querySelectorAll('.draw-border-top'), {
        scaleX: 1,
        duration: 1.1,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: swissGrid,
          start: 'top 82%'
        }
      });

      gsap.to(swissGrid.querySelectorAll('.draw-border-right'), {
        scaleY: 1,
        duration: 1.1,
        stagger: 0.12,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: swissGrid,
          start: 'top 82%'
        }
      });

      swissGrid.querySelectorAll('.js-counter[data-target]').forEach((el) => {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 86%',
            once: true
          },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.val));
          }
        });
      });
    }

    // Masked heading reveals across all sections
    document.querySelectorAll('.js-reveal-lines').forEach((heading) => {
      gsap.from(heading, {
        y: 36,
        opacity: 0,
        duration: 0.95,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 86%',
          once: true
        }
      });
    });

    document.querySelectorAll('.js-reveal-fade').forEach((block) => {
      gsap.from(block, {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: block,
          start: 'top 88%',
          once: true
        }
      });
    });

    // Anchor hash alignment after all pin spacers are created
    if (window.location.hash && window.location.hash !== '#top' && window.location.hash !== '#proces') {
      setTimeout(() => {
        ScrollTrigger.refresh();
        const target = document.querySelector(window.location.hash);
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo(0, top);
        }
      }, 100);
    }
  }
})();
