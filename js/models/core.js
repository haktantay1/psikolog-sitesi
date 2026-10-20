/* Etkileşimli topoloji modelleri için ortak altyapı.
   Three.js r128 (js/vendor/three.min.js) üzerine: sahne, ışık, döndürme/yakınlaştırma,
   dokunmatik ve klavye denetimi, seçme, tema renkleri, ekran dışındayken durma. */
(function () {
  "use strict";
  var LANG = (document.documentElement.lang || "tr").slice(0, 2);
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var darkQ = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : { matches: false };

  function palette() {
    var dark = darkQ.matches;
    return dark ? {
      bg: 0x1a1816, ink: 0xe6e0d6, ink3: 0x8e867b, rule: 0x3a3530,
      R: 0xd77a6e, S: 0x7fa6c9, I: 0xd9b45f, X: 0x9fc68a, accent: 0xd49a8f, surface: 0xcfc6b8
    } : {
      bg: 0xfaf8f4, ink: 0x1f1c19, ink3: 0x7a7268, rule: 0xdcd5ca,
      R: 0x9e3a32, S: 0x2f5d84, I: 0xb8892a, X: 0x4f7d3a, accent: 0x7a2e2a, surface: 0xb9ad9c
    };
  }

  function t(dict) { return dict[LANG] || dict.tr; }

  function create(host, opts) {
    opts = opts || {};
    var pal = palette();
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: !!opts.capture });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(pal.bg, 1);
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute("tabindex", "0");
    if (opts.label) renderer.domElement.setAttribute("aria-label", opts.label);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(opts.fov || 40, 1, 0.05, 200);
    var dist = opts.distance || 9, minD = opts.minDistance || 3, maxD = opts.maxDistance || 25;
    var root = new THREE.Group();
    scene.add(root);

    scene.add(new THREE.HemisphereLight(0xffffff, darkQ.matches ? 0x222222 : 0x8a7f72, darkQ.matches ? 0.75 : 0.85));
    var key = new THREE.DirectionalLight(0xffffff, 0.75); key.position.set(4, 7, 6); scene.add(key);
    var rim = new THREE.DirectionalLight(0xffffff, 0.35); rim.position.set(-6, -2, -5); scene.add(rim);

    var yaw = opts.yaw != null ? opts.yaw : 0.6, pitch = opts.pitch != null ? opts.pitch : 0.35;
    var autoRotate = !reduce && opts.autoRotate !== false, idleSince = 0;
    function placeCamera() {
      pitch = Math.max(-1.45, Math.min(1.45, pitch));
      camera.position.set(dist * Math.cos(pitch) * Math.sin(yaw), dist * Math.sin(pitch), dist * Math.cos(pitch) * Math.cos(yaw));
      camera.lookAt(opts.target || new THREE.Vector3(0, 0, 0));
    }

    function resize() {
      var w = host.clientWidth, h = host.clientHeight || Math.round(w * 0.62);
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%"; renderer.domElement.style.height = "100%";
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(host);

    // pointer: drag rotates, pinch/wheel zooms, a click without drag picks
    var el = renderer.domElement, pointers = {}, downAt = null, moved = 0, pinch0 = 0, d0 = dist;
    el.style.touchAction = "none";
    el.addEventListener("pointerdown", function (e) {
      el.setPointerCapture(e.pointerId); pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      downAt = { x: e.clientX, y: e.clientY }; moved = 0; autoRotate = false; idleSince = performance.now();
      var ids = Object.keys(pointers);
      if (ids.length === 2) { var a = pointers[ids[0]], b = pointers[ids[1]]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); d0 = dist; }
    });
    el.addEventListener("pointermove", function (e) {
      var p = pointers[e.pointerId]; if (!p) return;
      var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      var ids = Object.keys(pointers);
      if (ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch0) dist = Math.max(minD, Math.min(maxD, d0 * pinch0 / d));
      } else { yaw -= dx * 0.008; pitch += dy * 0.008; }
      moved += Math.abs(dx) + Math.abs(dy); idleSince = performance.now();
    });
    function up(e) {
      if (pointers[e.pointerId] && Object.keys(pointers).length === 1 && moved < 6 && pickHandler) doPick(e);
      delete pointers[e.pointerId]; if (Object.keys(pointers).length < 2) pinch0 = 0;
    }
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", function (e) {
      e.preventDefault(); dist = Math.max(minD, Math.min(maxD, dist * (1 + Math.sign(e.deltaY) * 0.08))); idleSince = performance.now();
    }, { passive: false });
    el.addEventListener("keydown", function (e) {
      var k = e.key, used = true;
      if (k === "ArrowLeft") yaw += 0.12; else if (k === "ArrowRight") yaw -= 0.12;
      else if (k === "ArrowUp") pitch += 0.1; else if (k === "ArrowDown") pitch -= 0.1;
      else if (k === "+" || k === "=") dist = Math.max(minD, dist * 0.9);
      else if (k === "-" || k === "_") dist = Math.min(maxD, dist * 1.1);
      else used = false;
      if (used) { e.preventDefault(); autoRotate = false; }
    });

    var raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2(), pickHandler = null, pickables = [];
    function doPick(e) {
      var r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      var hits = raycaster.intersectObjects(pickables, true);
      if (hits.length) {
        var o = hits[0].object; while (o && !o.userData.pick && o.parent) o = o.parent;
        pickHandler(o, hits[0]);
      }
    }

    var frameFns = [], visible = true, last = performance.now(), clock = 0;
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(host);
    function loop(now) {
      requestAnimationFrame(loop);
      if (!visible || document.hidden) { last = now; return; }
      var dt = Math.min(0.05, (now - last) / 1000); last = now; clock += dt;
      if (!autoRotate && !reduce && opts.autoRotate !== false && now - idleSince > 9000) autoRotate = true;
      if (autoRotate) yaw += dt * 0.18;
      for (var i = 0; i < frameFns.length; i++) frameFns[i](dt, clock);
      placeCamera(); renderer.render(scene, camera);
    }
    resize(); placeCamera(); requestAnimationFrame(loop);
    darkQ.addEventListener && darkQ.addEventListener("change", function () { location.reload(); });

    return {
      THREE: THREE, scene: scene, root: root, camera: camera, renderer: renderer, pal: pal, reduce: reduce, lang: LANG,
      onFrame: function (fn) { frameFns.push(fn); },
      pick: function (objs, fn) { pickables = objs; pickHandler = fn; el.style.cursor = "pointer"; },
      setView: function (y, p, d) { yaw = y; pitch = p; if (d) dist = d; autoRotate = false; idleSince = performance.now(); },
      stopAuto: function () { autoRotate = false; idleSince = performance.now(); }
    };
  }

  // --- UI helpers
  function controls(host) {
    var box = document.createElement("div"); box.className = "model-controls"; host.appendChild(box);
    var status = document.createElement("p"); status.className = "model-status"; status.setAttribute("aria-live", "polite");
    host.appendChild(status);
    return {
      button: function (label, fn, opt) {
        var b = document.createElement("button"); b.type = "button"; b.className = "model-btn"; b.textContent = label;
        if (opt && opt.pressed != null) b.setAttribute("aria-pressed", String(opt.pressed));
        b.addEventListener("click", function () { fn(b); }); box.appendChild(b); return b;
      },
      slider: function (label, min, max, step, value, fn) {
        var w = document.createElement("label"); w.className = "model-slider";
        var s = document.createElement("span"); s.textContent = label;
        var i = document.createElement("input"); i.type = "range"; i.min = min; i.max = max; i.step = step; i.value = value;
        var o = document.createElement("output"); o.textContent = value;
        i.addEventListener("input", function () { o.textContent = i.value; fn(parseFloat(i.value)); });
        w.appendChild(s); w.appendChild(i); w.appendChild(o); box.appendChild(w); return i;
      },
      group: function () { var g = document.createElement("div"); g.className = "model-group"; box.appendChild(g); return g; },
      status: function (txt) { status.textContent = txt; }
    };
  }

  // tube along a closed parametric curve
  function tube(fn, radius, color, segs) {
    class Closed extends THREE.Curve {
      getPoint(u, target) { var p = fn(u * Math.PI * 2); return (target || new THREE.Vector3()).set(p[0], p[1], p[2]); }
    }
    var g = new THREE.TubeGeometry(new Closed(), segs || 320, radius, 24, true);
    var m = new THREE.MeshStandardMaterial({ color: color, roughness: 0.42, metalness: 0.08 });
    return new THREE.Mesh(g, m);
  }

  // parametric surface (u,v in [0,1])
  function surface(fn, nu, nv, material) {
    var pos = [], idx = [], uv = [];
    for (var j = 0; j <= nv; j++) for (var i = 0; i <= nu; i++) {
      var p = fn(i / nu, j / nv); pos.push(p[0], p[1], p[2]); uv.push(i / nu, j / nv);
    }
    for (j = 0; j < nv; j++) for (i = 0; i < nu; i++) {
      var a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, c, b, b, c, d);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    return new THREE.Mesh(g, material);
  }

  function label(text, color, size) {
    var c = document.createElement("canvas"), s = 128; c.width = c.height = s;
    var x = c.getContext("2d"); x.font = "italic 600 88px 'EB Garamond', Garamond, serif"; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillStyle = "#" + new THREE.Color(color).getHexString(); x.fillText(text, s / 2, s / 2 + 4);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true }));
    sp.scale.set(size || 0.7, size || 0.7, 1); sp.renderOrder = 10; return sp;
  }

  function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  // tween a number from a to b over ms, calling set(v); returns a stop function
  function tween(model, ms, set, done) {
    var tt = 0, alive = true, dur = model.reduce ? 0.001 : ms / 1000;
    model.onFrame(function (dt) {
      if (!alive) return; tt = Math.min(1, tt + dt / dur); set(ease(tt)); if (tt >= 1) { alive = false; if (done) done(); }
    });
    return function () { alive = false; };
  }

  window.PsyModel = { create: create, controls: controls, tube: tube, surface: surface, label: label, tween: tween, t: t, ease: ease };
})();
