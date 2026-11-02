/**
 * Zora Labs — 3D WebGL Spatial Sculpture & Scroll-Driven Optical Field (webgl-scene.js)
 * Built with Three.js (with a full 2D Canvas fallback when WebGL is disabled).
 * Continuously morphs across the entire scroll journey (0% -> 100%):
 *  - Stage 0 (Opening): Sweeping 3D helical wave of 16:9 optical frame gates (Davaris / Refactory vibe)
 *  - Stage 1 (01 Break it down): Radial Z-axis explosion into distinct acoustic & visual slices
 *  - Stage 2 (02 Think again): Semantic filtering — outer slices dim, core golden/vermilion nodes connect
 *  - Stage 3 (03 Make it matter): 90-degree geometric torsion into a razor-sharp 9:16 vertical cinema monolith
 *  - Stage 4 (04 Put it to work): Calibrated broadcast rings & harmonic wave field
 *  - Downstream acts (Manifesto / Deck / Horizontal Pipeline / Finale): Camera orbit & depth field evolution
 */
(function () {
  'use strict';

  // Shared reactive state read at 60fps by WebGL/Canvas and written by Lenis/ScrollTrigger
  window.zoraSceneState = {
    heroProgress: 0,     // 0..1 inside Act I (#proces)
    globalProgress: 0,   // 0..1 across entire document
    horizontalProgress: 0, // 0..1 inside Act IV (#system)
    velocity: 0,         // smoothed scroll velocity
    mouseX: 0,           // -1..1
    mouseY: 0,           // -1..1
    theme: 'dark'
  };

  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('webglCanvas');
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Track pointer for subtle 3D camera parallax
    window.addEventListener(
      'pointermove',
      (e) => {
        window.zoraSceneState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        window.zoraSceneState.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      },
      { passive: true }
    );

    const initializedWebGL =
      typeof window.THREE !== 'undefined' && initThreeScene(canvas, prefersReducedMotion);

    if (!initializedWebGL) {
      initCanvas2DFallback(canvas, prefersReducedMotion);
    }
  });

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  /* ==========================================================================
     THREE.JS 3D WEBGL INSTALLATION
     ========================================================================== */
  function initThreeScene(canvas, prefersReducedMotion) {
    const THREE = window.THREE;
    let renderer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (_) {
      return false;
    }

    const isMobile = window.innerWidth < 900;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.042);

    const camera = new THREE.PerspectiveCamera(
      46,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    camera.position.set(0, 0, 14);

    // Master sculpture group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. 36 Architectural Optical Frame Slices (16:9 base geometry that morphs to 9:16 via scale/rotation)
    const SLICE_COUNT = isMobile ? 22 : 36;
    const framesGroup = new THREE.Group();
    rootGroup.add(framesGroup);

    const basePlaneGeo = new THREE.PlaneGeometry(3.2, 1.8);
    const baseEdgesGeo = new THREE.EdgesGeometry(basePlaneGeo);

    // Brand-authentic industrial palette from Zora SVG (#E63621 vermilion, #F6A113 amber, #026D83 optical teal, #EDEFF4 ivory)
    const colorIvory = new THREE.Color(0xf2efe9);
    const colorVermilion = new THREE.Color(0xe63621);
    const colorAmber = new THREE.Color(0xf6a113);
    const colorTeal = new THREE.Color(0x038ba6);
    const colorMuted = new THREE.Color(0x3a3835);

    const slices = [];

    for (let i = 0; i < SLICE_COUNT; i++) {
      const norm = i / (SLICE_COUNT - 1) - 0.5; // -0.5 .. +0.5
      const isCoreSemantic = i % 5 === 0 || Math.abs(norm) < 0.12;

      const edgeColor = isCoreSemantic
        ? i % 2 === 0
          ? colorVermilion.clone()
          : colorAmber.clone()
        : i % 3 === 0
        ? colorTeal.clone()
        : colorIvory.clone();

      const lineMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: isCoreSemantic ? 0.52 : 0.16,
        blending: THREE.AdditiveBlending
      });

      const fillMat = new THREE.MeshBasicMaterial({
        color: isCoreSemantic ? 0x1a1412 : 0x0b0c0e,
        transparent: true,
        opacity: isCoreSemantic ? 0.14 : 0.05,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const sliceHolder = new THREE.Group();
      const fillMesh = new THREE.Mesh(basePlaneGeo, fillMat);
      const wireMesh = new THREE.LineSegments(baseEdgesGeo, lineMat);
      sliceHolder.add(fillMesh);
      sliceHolder.add(wireMesh);

      // Random deterministic explosion vectors for Beat 01 ("Break it down")
      const angle = i * 2.39996; // golden angle
      const radius = 2.2 + (i % 7) * 0.68;

      slices.push({
        group: sliceHolder,
        lineMat,
        fillMat,
        isCore: isCoreSemantic,
        norm,
        index: i,
        explodeX: Math.cos(angle) * radius * 1.45,
        explodeY: Math.sin(angle) * radius * 0.95,
        explodeZ: norm * 14.0,
        explodeRotX: Math.sin(i * 1.7) * 0.85,
        explodeRotY: Math.cos(i * 1.3) * 1.1,
        explodeRotZ: Math.sin(i * 0.9) * 0.65,
        baseEdgeColor: edgeColor.clone()
      });

      framesGroup.add(sliceHolder);
    }

    // 2. Calibration Orbital Rings (Precision optical engineering)
    const ringsGroup = new THREE.Group();
    rootGroup.add(ringsGroup);

    const createRing = (radius, segments, colorHex, opacity) => {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending
      });
      return new THREE.Line(geo, mat);
    };

    const ringOuter = createRing(5.4, 128, 0xf2efe9, 0.09);
    const ringMid = createRing(3.9, 96, 0xe63621, 0.16);
    const ringInner = createRing(2.6, 80, 0x038ba6, 0.14);
    ringOuter.rotation.x = 1.15;
    ringMid.rotation.y = 0.75;
    ringInner.rotation.x = -0.85;
    ringsGroup.add(ringOuter, ringMid, ringInner);

    // 3. Fluid Helical Particle Field (Davaris wave + Zora acoustic spectrum)
    const PARTICLE_COUNT = isMobile ? 700 : 1650;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(PARTICLE_COUNT * 3);
    const pBase = new Float32Array(PARTICLE_COUNT * 3);
    const pColors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const t = i / PARTICLE_COUNT;
      const strand = i % 2 === 0 ? 1 : -1;
      const theta = t * Math.PI * 10 + (strand > 0 ? 0 : Math.PI);
      const spread = 0.35 + Math.random() * 1.85;

      const bx = (t - 0.5) * 26;
      const by = Math.sin(theta) * (1.8 + spread * 0.7) + (Math.random() - 0.5) * 1.2;
      const bz = Math.cos(theta) * (1.8 + spread * 0.7) + (Math.random() - 0.5) * 2.5;

      pBase[i3] = bx;
      pBase[i3 + 1] = by;
      pBase[i3 + 2] = bz;

      pPositions[i3] = bx;
      pPositions[i3 + 1] = by;
      pPositions[i3 + 2] = bz;

      const cChoice = i % 11 === 0 ? colorVermilion : i % 7 === 0 ? colorAmber : i % 5 === 0 ? colorTeal : colorIvory;
      pColors[i3] = cChoice.r;
      pColors[i3 + 1] = cChoice.g;
      pColors[i3 + 2] = cChoice.b;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: isMobile ? 0.055 : 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.58,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(pGeo, pMat);
    rootGroup.add(particleSystem);

    // Resize handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Smooth internal trackers
    let smoothHero = 0;
    let smoothGlobal = 0;
    let smoothHoriz = 0;
    let smoothVel = 0;
    let smoothMX = 0;
    let smoothMY = 0;
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const elapsed = prefersReducedMotion ? 0 : clock.getElapsedTime();
      const st = window.zoraSceneState;

      smoothHero = lerp(smoothHero, st.heroProgress, 0.08);
      smoothGlobal = lerp(smoothGlobal, st.globalProgress, 0.07);
      smoothHoriz = lerp(smoothHoriz, st.horizontalProgress, 0.08);
      smoothVel = lerp(smoothVel, st.velocity, 0.1);
      smoothMX = lerp(smoothMX, st.mouseX, 0.05);
      smoothMY = lerp(smoothMY, st.mouseY, 0.05);

      // Update Fog for theme
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      scene.fog.color.setHex(isLight ? 0xf2efe9 : 0x050505);
      pMat.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      pMat.opacity = isLight ? 0.35 : 0.58;

      // Blend weights for the 4 Hero Scrollytelling stages:
      // Stage 0: 0.00..0.10 (Sculptural helical wave)
      // Stage 1: 0.10..0.34 (Break it down — radial explosion)
      // Stage 2: 0.34..0.58 (Think again — semantic constellation)
      // Stage 3: 0.58..0.85 (Make it matter — 9:16 vertical cinema monolith)
      // Stage 4: 0.85..1.00 (Put it to work — broadcast lock)
      const wExplode = smoothstep(0.06, 0.24, smoothHero) * (1 - smoothstep(0.34, 0.52, smoothHero));
      const wSemantic = smoothstep(0.32, 0.48, smoothHero) * (1 - smoothstep(0.58, 0.74, smoothHero));
      const wVertical = smoothstep(0.56, 0.78, smoothHero);
      const wDownstream = smoothstep(0.18, 0.35, smoothGlobal);

      // Morph each of the 36 3D Frame Gates
      for (let i = 0; i < slices.length; i++) {
        const s = slices[i];
        const wave = Math.sin(elapsed * 0.9 + s.norm * 5.5);
        const cosWave = Math.cos(elapsed * 0.7 + s.norm * 4.2);

        // Stage 0: Sweeping 3D wave ribbon
        let tx = s.norm * 8.5 + cosWave * 0.35;
        let ty = wave * 1.15;
        let tz = Math.sin(s.norm * Math.PI) * -2.8 + cosWave * 0.4;
        let rx = wave * 0.22;
        let ry = s.norm * -0.85;
        let rz = s.norm * 0.35 + wave * 0.08;
        let sx = 1.0;
        let sy = 1.0;

        // Blend Stage 1: Radial Explosion ("01 Rozbiór materiału")
        tx = lerp(tx, s.explodeX, wExplode);
        ty = lerp(ty, s.explodeY + wave * 0.25, wExplode);
        tz = lerp(tz, s.explodeZ, wExplode);
        rx = lerp(rx, s.explodeRotX + elapsed * 0.15, wExplode);
        ry = lerp(ry, s.explodeRotY + elapsed * 0.12, wExplode);
        rz = lerp(rz, s.explodeRotZ, wExplode);

        // Blend Stage 2: Semantic alignment ("02 Kontekst semantyczny")
        const semX = s.isCore ? s.norm * 4.2 : s.explodeX * 1.35;
        const semY = s.isCore ? Math.sin(s.index + elapsed) * 0.35 : s.explodeY * 1.35;
        const semZ = s.isCore ? s.norm * 3.5 : -7.5;
        tx = lerp(tx, semX, wSemantic);
        ty = lerp(ty, semY, wSemantic);
        tz = lerp(tz, semZ, wSemantic);
        rx = lerp(rx, 0.08 * wave, wSemantic);
        ry = lerp(ry, s.isCore ? 0.25 : 0.8, wSemantic);
        rz = lerp(rz, 0, wSemantic);

        // Blend Stage 3 & 4: 9:16 Vertical Monolith Tunnel ("03 Geometria kadru" -> "04 Gotowość")
        // Rotate 90deg (Math.PI / 2) or scale plane (3.2x1.8 -> 1.85x3.28) to frame the central 9:16 video!
        const vertZ = (s.norm - 0.1) * 9.5;
        const vertScaleBoost = 1 + Math.abs(s.norm) * 0.35;
        tx = lerp(tx, 0, wVertical);
        ty = lerp(ty, 0, wVertical);
        tz = lerp(tz, vertZ, wVertical);
        rx = lerp(rx, 0, wVertical);
        ry = lerp(ry, wave * 0.05, wVertical);
        rz = lerp(rz, Math.PI * 0.5, wVertical); // 16:9 rotated 90 deg = true 9:16!
        sx = lerp(sx, 1.05 * vertScaleBoost, wVertical);
        sy = lerp(sy, 1.05 * vertScaleBoost, wVertical);

        // Downstream page scroll: subtle parting to frame editorial sections & horizontal glide
        if (wDownstream > 0.01) {
          const side = i % 2 === 0 ? 1 : -1;
          tx = lerp(tx, side * (4.6 + Math.abs(s.norm) * 3.2) - smoothHoriz * 3.0, wDownstream * 0.85);
          ty = lerp(ty, s.norm * 5.5 + wave * 0.4, wDownstream * 0.65);
          tz = lerp(tz, -3.5 - Math.abs(s.norm) * 6.0, wDownstream * 0.75);
          ry = lerp(ry, side * -0.55, wDownstream * 0.7);
        }

        s.group.position.set(tx, ty, tz);
        s.group.rotation.set(rx, ry, rz);
        s.group.scale.set(sx, sy, 1);

        // Dynamic Opacity
        let targetLineOp = s.isCore ? 0.5 : 0.16;
        if (wSemantic > 0.1) {
          targetLineOp = lerp(targetLineOp, s.isCore ? 0.82 : 0.04, wSemantic);
        }
        if (wVertical > 0.1) {
          targetLineOp = lerp(targetLineOp, s.isCore ? 0.42 : 0.11, wVertical);
        }
        if (wDownstream > 0.1) {
          targetLineOp *= lerp(1, 0.48, wDownstream);
        }
        if (isLight) {
          s.lineMat.blending = THREE.NormalBlending;
          s.lineMat.color.copy(s.isCore ? colorVermilion : colorMuted);
          targetLineOp *= 0.65;
        } else {
          s.lineMat.blending = THREE.AdditiveBlending;
          s.lineMat.color.copy(s.baseEdgeColor);
        }
        s.lineMat.opacity = targetLineOp;
      }

      // Animate Orbital Rings + Scroll Velocity Warp
      const velStretch = Math.min(Math.abs(smoothVel) * 0.015, 0.6);
      ringOuter.rotation.z = elapsed * 0.08 + smoothGlobal * Math.PI * 2;
      ringMid.rotation.x = 0.6 + elapsed * 0.14 + smoothHero * Math.PI;
      ringMid.rotation.z = -elapsed * 0.1;
      ringInner.rotation.y = elapsed * 0.18 + smoothHero * Math.PI * 1.5;
      ringsGroup.scale.setScalar(lerp(1.0, 0.78, wVertical) + velStretch * 0.18);

      // Animate Helical Wave Particles
      const posAttr = pGeo.attributes.position;
      const arr = posAttr.array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const bx = pBase[i3];
        const by = pBase[i3 + 1];
        const bz = pBase[i3 + 2];
        const phase = elapsed * 0.65 + bx * 0.28;
        arr[i3] = bx * lerp(1, 0.55, wVertical);
        arr[i3 + 1] = by + Math.sin(phase) * (0.35 + velStretch);
        arr[i3 + 2] = bz + Math.cos(phase) * 0.35;
      }
      posAttr.needsUpdate = true;
      particleSystem.rotation.y = smoothGlobal * 1.25 - smoothHoriz * 0.8;

      // Camera Choreography + Mouse Parallax
      const camZ = lerp(13.2, 9.8, smoothstep(0.1, 0.8, smoothHero)) + wDownstream * 2.2;
      camera.position.x = smoothMX * 1.15;
      camera.position.y = smoothMY * 0.75;
      camera.position.z = camZ;
      camera.lookAt(0, 0, 0);

      rootGroup.rotation.z = smoothVel * 0.0008;

      renderer.render(scene, camera);
    }

    animate();
    return true;
  }

  /* ==========================================================================
     2D CANVAS FALLBACK (For --disable-gpu / Software Environments)
     Renders the exact same 3D-projected architectural frames & wave field!
     ========================================================================== */
  function initCanvas2DFallback(canvas, prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    let start = performance.now();
    let smoothHero = 0;
    let smoothGlobal = 0;

    function draw(now) {
      requestAnimationFrame(draw);
      const t = prefersReducedMotion ? 0 : (now - start) * 0.001;
      const st = window.zoraSceneState;
      smoothHero = lerp(smoothHero, st.heroProgress, 0.08);
      smoothGlobal = lerp(smoothGlobal, st.globalProgress, 0.08);

      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5 + st.mouseX * 28;
      const cy = height * 0.5 - st.mouseY * 20;

      // Subtle atmospheric radial glow
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.48);
      if (isLight) {
        grad.addColorStop(0, 'rgba(230, 54, 33, 0.07)');
        grad.addColorStop(0.5, 'rgba(2, 109, 131, 0.04)');
        grad.addColorStop(1, 'rgba(242, 239, 233, 0)');
      } else {
        grad.addColorStop(0, 'rgba(230, 54, 33, 0.14)');
        grad.addColorStop(0.45, 'rgba(246, 161, 19, 0.06)');
        grad.addColorStop(0.75, 'rgba(2, 109, 131, 0.05)');
        grad.addColorStop(1, 'rgba(5, 5, 5, 0)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw 24 projected 3D optical frames
      const wVert = smoothstep(0.55, 0.8, smoothHero);
      const wExp = smoothstep(0.08, 0.28, smoothHero) * (1 - smoothstep(0.36, 0.56, smoothHero));

      for (let i = 0; i < 24; i++) {
        const norm = i / 23 - 0.5;
        const wave = Math.sin(t * 0.9 + norm * 5.0);
        const baseW = lerp(Math.min(width * 0.46, 560), 220, wVert);
        const baseH = lerp(Math.min(height * 0.42, 315), 390, wVert);
        const scale = 0.55 + (i / 24) * 0.68;

        const ox = norm * width * 0.34 * (1 - wVert * 0.82) + Math.cos(i * 2.4) * 90 * wExp;
        const oy = wave * 42 * (1 - wVert * 0.7) + Math.sin(i * 2.4) * 65 * wExp;

        ctx.save();
        ctx.translate(cx + ox, cy + oy);
        ctx.rotate(norm * 0.22 * (1 - wVert) + wave * 0.04);

        const isAccent = i % 6 === 0;
        ctx.strokeStyle = isAccent
          ? `rgba(230, 54, 33, ${isLight ? 0.22 : 0.34})`
          : isLight
          ? 'rgba(20, 20, 18, 0.09)'
          : 'rgba(242, 239, 233, 0.11)';
        ctx.lineWidth = isAccent ? 1.2 : 0.8;
        ctx.strokeRect((-baseW * scale) / 2, (-baseH * scale) / 2, baseW * scale, baseH * scale);
        ctx.restore();
      }

      // Draw orbital calibration circle
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = isLight ? 'rgba(20,20,18,0.08)' : 'rgba(242,239,233,0.09)';
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(width, height) * 0.36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    requestAnimationFrame(draw);
  }
})();
