/* Borromean düğümü: üç halkadan biri kesilince öbür ikisi serbest kalır.
   İkinci kip: Lacan'ın Joyce okumasındaki “lapsus” ve onu onaran dördüncü halka, sinthome. */
(function () {
  "use strict";
  var P = window.PsyModel, T = P.t;
  var host = document.getElementById("model");
  var L = {
    label: { tr: "Üç halkalı Borromean düğümünün döndürülebilir üç boyutlu modeli", en: "Rotatable three-dimensional model of the three-ring Borromean knot", fr: "Modèle tridimensionnel orientable du nœud borroméen à trois ronds" },
    R: { tr: "Gerçek", en: "Real", fr: "Réel" }, S: { tr: "Simgesel", en: "Symbolic", fr: "Symbolique" }, I: { tr: "Hayali", en: "Imaginary", fr: "Imaginaire" },
    cut: { tr: "Kes: ", en: "Cut: ", fr: "Couper : " },
    knot: { tr: "Düğümü yeniden bağla", en: "Tie the knot again", fr: "Renouer le nœud" },
    labels: { tr: "Harfleri göster", en: "Show letters", fr: "Afficher les lettres" },
    mode1: { tr: "Borromean düğümü", en: "Borromean knot", fr: "Nœud borroméen" },
    mode2: { tr: "Lapsus ve sinthome", en: "Lapsus and sinthome", fr: "Lapsus et sinthome" },
    addSinthome: { tr: "Dördüncü halkayı ekle", en: "Add the fourth ring", fr: "Ajouter le quatrième rond" },
    s0: { tr: "Üç halka birbirine bağlı. Ama dikkatle bakın: Hiçbir halka bir başkasının içinden geçmiyor. Bir halkaya tıklayın ya da aşağıdan birini kesin.", en: "The three rings hold together. But look closely: no ring passes through another. Click a ring, or cut one below.", fr: "Les trois ronds tiennent ensemble. Mais regardez bien : aucun rond ne passe dans un autre. Cliquez sur un rond, ou coupez-en un ci-dessous." },
    s1: { tr: "{x} kesildi. Kalan iki halka hiçbir zaman birbirine bağlı değildi; şimdi serbestçe ayrılıyorlar. Borromean düğümünü tutan, ikili bağlar değil, üçünün birlikte kurduğu yapıdır.", en: "{x} has been cut. The two remaining rings were never linked to each other; now they drift apart freely. What holds the Borromean knot is not a pairwise link but the structure the three form together.", fr: "{x} a été coupé. Les deux ronds restants n'ont jamais été noués l'un à l'autre ; ils se séparent librement. Ce qui tient le nœud borroméen, ce n'est pas un lien deux à deux, mais la structure que les trois forment ensemble." },
    s2: { tr: "Lapsus: Gerçek ile Simgesel'in kesiştiği yerde bir hata, iki halkayı doğrudan birbirine zincirledi. Hayali artık tutunmuyor ve kayıp gidiyor. Lacan, Joyce'ta beden imgesinin bu biçimde “düşebildiğini” düşündü.", en: "Lapsus: an error at a crossing has chained the Real and the Symbolic directly to each other. The Imaginary no longer holds and slips away. Lacan thought that in Joyce the body image could “drop away” in this way.", fr: "Lapsus : une erreur à un croisement a enchaîné directement le Réel et le Symbolique. L'Imaginaire ne tient plus et glisse. Lacan pensait que chez Joyce l'image du corps pouvait ainsi « se laisser tomber »." },
    s3: { tr: "Dördüncü halka, sinthome, kayan Hayali'yi yeniden yapıya bağlar. Lacan'a göre Joyce'ta bu işlevi yazı, bir ad yapma çabası üstlenir. Düğüm artık Borromean değil; ama bir arada tutunuyor.", en: "The fourth ring, the sinthome, ties the slipping Imaginary back into the structure. For Lacan, in Joyce this function is taken on by writing, by the effort to make a name. The knot is no longer Borromean; but it holds together.", fr: "Le quatrième rond, le sinthome, rattache l'Imaginaire qui glissait à la structure. Pour Lacan, chez Joyce, cette fonction est assumée par l'écriture, par l'effort de se faire un nom. Le nœud n'est plus borroméen ; mais il tient." },
    hint: { tr: "Sürükle: döndür · Kaydır ya da iki parmak: yakınlaştır · Halkaya tıkla: kes", en: "Drag: rotate · Scroll or pinch: zoom · Click a ring: cut", fr: "Glisser : tourner · Molette ou pincer : zoomer · Cliquer un rond : couper" }
  };
  var M = P.create(host, { label: T(L.label), distance: 7.6, pitch: 0.42, yaw: 0.75 });
  var THREE = M.THREE, pal = M.pal, ui = P.controls(document.getElementById("model-panel"));
  var hint = document.createElement("p"); hint.className = "model-hint"; hint.textContent = T(L.hint); host.appendChild(hint);

  // --- Borromean rings: three mutually perpendicular ellipses (2:1)
  var defs = {
    R: { fn: function (t) { return [2 * Math.cos(t), Math.sin(t), 0]; }, away: [1, 0, 0] },
    S: { fn: function (t) { return [0, 2 * Math.cos(t), Math.sin(t)]; }, away: [0, 1, 0] },
    I: { fn: function (t) { return [Math.sin(t), 0, 2 * Math.cos(t)]; }, away: [0, 0, 1] }
  };
  var rings = {}, letters = [];
  ["R", "S", "I"].forEach(function (k) {
    var g = new THREE.Group(); g.userData.pick = k;
    var mesh = P.tube(defs[k].fn, 0.13, pal[k]); mesh.material.transparent = true; g.add(mesh);
    var lp = defs[k].fn(Math.PI * 0.18); var lab = P.label(k, pal[k], 0.75); lab.position.set(lp[0] * 1.12, lp[1] * 1.12 + 0.25, lp[2] * 1.12); lab.visible = false;
    g.add(lab); letters.push(lab); M.root.add(g); rings[k] = { g: g, mesh: mesh, off: new THREE.Vector3(), target: new THREE.Vector3(), alpha: 1 };
  });
  // separating direction for the two rings left after a cut (they are unlinked; translating along this axis frees them)
  var sepAxis = { R: "S", S: "R", I: "S" };

  // --- second mode: Hopf-linked R and S, slipping I, and a fourth ring Σ
  function circle(c, a, b, r) { return function (t) { return [c[0] + r * (a[0] * Math.cos(t) + b[0] * Math.sin(t)), c[1] + r * (a[1] * Math.cos(t) + b[1] * Math.sin(t)), c[2] + r * (a[2] * Math.cos(t) + b[2] * Math.sin(t))]; }; }
  var lap = new THREE.Group(); lap.visible = false; M.root.add(lap);
  var lR = P.tube(circle([-1.9, 0, 0], [1, 0, 0], [0, 1, 0], 1.6), 0.12, pal.R);
  var lS = P.tube(circle([0.1, 0, 0], [1, 0, 0], [0, 0, 1], 1.6), 0.12, pal.S);
  var lI = P.tube(circle([0, 0, 0], [0, 1, 0], [0, 0, 1], 1.0), 0.12, pal.I);
  var lX = P.tube(circle([0, 0, 0], [1, 0, 0], [0, 1, 0], 1.25), 0.12, pal.X); lX.material.transparent = true; lX.position.set(2.4, 0.6, 0);
  var iHolder = new THREE.Group(); iHolder.add(lI); lap.add(lR); lap.add(lS); lap.add(iHolder); lap.add(lX);
  var lLetters = [[lR, "R", [-3.7, 0.4, 0]], [lS, "S", [0.1, 0.3, 1.9]], [lX, "Σ", [2.4, 2.15, 0]]].map(function (e) {
    var s = P.label(e[1], pal[e[1] === "Σ" ? "X" : e[1]], 0.75); s.position.set(e[2][0], e[2][1], e[2][2]); s.visible = false; lap.add(s); return s;
  });
  var iLetter = P.label("I", pal.I, 0.75); iLetter.position.set(0, 1.35, 0); iLetter.visible = false; iHolder.add(iLetter); lLetters.push(iLetter);
  var iX = 3.3, iTarget = 3.3, xScale = 0, xTarget = 0, mode = 1, showLetters = false;
  iHolder.position.set(iX, 0, 0); lX.scale.setScalar(0.0001);

  var cutKey = null;
  function cut(k) {
    if (mode !== 1) return;
    cutKey = k;
    // separating moves checked so that the two survivors never pass through each other on the way
    var plan = { R: ["S", "I", [0, 1, 0]], S: ["R", "I", [0, 0, 1]], I: ["S", "R", [1, 0, 0]] }[k];
    var mover = plan[0], stay = plan[1], dir = new THREE.Vector3(plan[2][0], plan[2][1], plan[2][2]);
    rings[k].target.set(0, 0, 0); rings[k].alpha = 0;
    rings[mover].target.copy(dir).multiplyScalar(2.4); rings[stay].target.copy(dir).multiplyScalar(-1.4);
    rings[mover].alpha = 1; rings[stay].alpha = 1;
    ui.status(T(L.s1).replace("{x}", T(L[k])));
    M.stopAuto();
  }
  function reknot() { Object.keys(rings).forEach(function (k) { rings[k].target.set(0, 0, 0); rings[k].alpha = 1; }); cutKey = null; ui.status(T(L.s0)); }

  M.pick([rings.R.g, rings.S.g, rings.I.g], function (o) { if (o.userData.pick) cut(o.userData.pick); });

  M.onFrame(function (dt, clock) {
    var k = Math.min(1, dt * 3.2);
    Object.keys(rings).forEach(function (n) {
      var r = rings[n]; r.off.lerp(r.target, k); r.g.position.copy(r.off);
      var a = r.mesh.material.opacity; r.mesh.material.opacity = a + (r.alpha - a) * k; r.g.visible = mode === 1 && r.mesh.material.opacity > 0.02;
    });
    iX += (iTarget - iX) * k;
    var drift = (mode === 2 && xTarget === 0) ? Math.sin(clock * 1.3) * 0.25 : 0;
    iHolder.position.set(iX, drift, drift * 0.6); iHolder.rotation.z = (mode === 2 && xTarget === 0) ? Math.sin(clock * 0.9) * 0.25 : 0;
    xScale += (xTarget - xScale) * k; lX.scale.setScalar(Math.max(0.0001, xScale)); lX.material.opacity = xScale;
  });

  // --- controls
  var g1 = ui.group();
  var bMode1 = ui.button(T(L.mode1), function () { setMode(1); }, { pressed: true });
  var bMode2 = ui.button(T(L.mode2), function () { setMode(2); }, { pressed: false });
  g1.appendChild(bMode1); g1.appendChild(bMode2);
  var g2 = ui.group(), cutBtns = [];
  ["R", "S", "I"].forEach(function (k) { var b = ui.button(T(L.cut) + T(L[k]), function () { cut(k); }); b.classList.add(k.toLowerCase()); g2.appendChild(b); cutBtns.push(b); });
  var bKnot = ui.button(T(L.knot), reknot); g2.appendChild(bKnot);
  var bSin = ui.button(T(L.addSinthome), function () { iTarget = 3.3; xTarget = 1; ui.status(T(L.s3)); }); bSin.hidden = true; g2.appendChild(bSin);
  var bLab = ui.button(T(L.labels), function (b) {
    showLetters = !showLetters; b.setAttribute("aria-pressed", String(showLetters));
    letters.concat(lLetters).forEach(function (s) { s.visible = showLetters; });
  }, { pressed: false }); g2.appendChild(bLab);

  function setMode(m) {
    mode = m; bMode1.setAttribute("aria-pressed", String(m === 1)); bMode2.setAttribute("aria-pressed", String(m === 2));
    Object.keys(rings).forEach(function (k) { rings[k].g.visible = m === 1; });
    lap.visible = m === 2; cutBtns.forEach(function (b) { b.hidden = m === 2; }); bKnot.hidden = m === 2; bSin.hidden = m !== 2;
    if (m === 1) { reknot(); M.setView(0.75, 0.42, 7.6); }
    else { iX = 3.3; iTarget = 5.2; xTarget = 0; xScale = 0; ui.status(T(L.s2)); M.setView(0.1, 0.35, 12); }
  }
  ui.status(T(L.s0));
})();
