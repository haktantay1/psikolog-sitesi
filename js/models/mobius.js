/* Möbius şeridi: tek yüz, tek kenar; ortadan kesildiğinde ikiye ayrılmaz. */
(function () {
  "use strict";
  var P = window.PsyModel, T = P.t;
  var host = document.getElementById("model");
  var L = {
    label: { tr: "Möbius şeridinin döndürülebilir üç boyutlu modeli", en: "Rotatable three-dimensional model of the Möbius strip", fr: "Modèle tridimensionnel orientable du ruban de Möbius" },
    walk: { tr: "Karıncayı yürüt", en: "Walk the ant", fr: "Faire marcher la fourmi" },
    stop: { tr: "Durdur", en: "Stop", fr: "Arrêter" },
    edge: { tr: "Kenarı göster", en: "Show the edge", fr: "Montrer le bord" },
    cut: { tr: "Ortadan kes", en: "Cut down the middle", fr: "Couper au milieu" },
    band: { tr: "Sıradan şerit (karşılaştır)", en: "Ordinary band (compare)", fr: "Bande ordinaire (comparer)" },
    reset: { tr: "Baştan al", en: "Start again", fr: "Recommencer" },
    width: { tr: "Genişlik", en: "Width", fr: "Largeur" },
    s0: { tr: "Bir Möbius şeridi: bir kâğıt şeridi yarım tur bükülüp uçları birleştirilmiş gibi. Karıncayı yürütün ve yüzeyden hiç ayrılmadan hangi yüze vardığına bakın.", en: "A Möbius strip: like a paper strip given a half twist before its ends are joined. Walk the ant and see which side it reaches without ever leaving the surface.", fr: "Un ruban de Möbius : comme une bande de papier à laquelle on donne une demi-torsion avant d'en joindre les bouts. Faites marcher la fourmi et voyez sur quelle face elle arrive sans jamais quitter la surface." },
    sWalk: { tr: "Karınca bir turu tamamladığında başladığı noktanın “arkasında” durur; ikinci turun sonunda başladığı yere döner. Bir iç ve bir dış yoktur: Şeridin tek bir yüzü vardır. Lacan özneyi bu yapıyla düşündü: Bilinç ile bilinçdışı iki ayrı yüz değil, aynı yüzün iki anıdır.", en: "When the ant completes one tour it stands “behind” the point where it started; at the end of the second tour it is back where it began. There is no inside and outside: the strip has one side. Lacan thought the subject with this structure: conscious and unconscious are not two separate sides but two moments of the same side.", fr: "Quand la fourmi achève un tour, elle se trouve « derrière » son point de départ ; à la fin du second tour, elle revient là où elle a commencé. Il n'y a ni dedans ni dehors : le ruban n'a qu'une face. Lacan a pensé le sujet avec cette structure : conscient et inconscient ne sont pas deux faces séparées, mais deux moments de la même face." },
    sEdge: { tr: "Şeridin kenarı tek bir kapalı eğridir. Sıradan bir şeridin iki kenarı vardır; Möbius şeridinin yalnızca bir.", en: "The edge of the strip is a single closed curve. An ordinary band has two edges; the Möbius strip has only one.", fr: "Le bord du ruban est une seule courbe fermée. Une bande ordinaire a deux bords ; le ruban de Möbius n'en a qu'un." },
    sCut: { tr: "Şeridi ortasından boyunca kestiniz. İki parça beklerdiniz; oysa tek bir şerit çıktı: iki kat uzun ve iki tam bükümlü. Bu yeni şerit artık Möbius değildir, iki yüzü vardır. Lacan için yorum böyle bir kesiktir: Yüzeyi bölmez, yapısını dönüştürür.", en: "You have cut the strip lengthwise down the middle. You would expect two pieces; instead one band came out, twice as long and with two full twists. This new band is no longer Möbius: it has two sides. For Lacan interpretation is such a cut: it does not divide the surface, it transforms its structure.", fr: "Vous avez coupé le ruban dans sa longueur, au milieu. On attendrait deux morceaux ; il en sort une seule bande, deux fois plus longue et à deux tours complets. Cette nouvelle bande n'est plus un ruban de Möbius : elle a deux faces. Pour Lacan, l'interprétation est une coupure de ce genre : elle ne divise pas la surface, elle en transforme la structure." },
    sBand: { tr: "Karşılaştırma için bükümsüz sıradan bir şerit. Karınca dış yüzde kaldıkça içe asla ulaşamaz; iki yüz, iki kenar vardır.", en: "For comparison, an ordinary band without a twist. As long as the ant stays on the outside it never reaches the inside; there are two sides, two edges.", fr: "Pour comparer, une bande ordinaire sans torsion. Tant que la fourmi reste à l'extérieur, elle n'atteint jamais l'intérieur ; il y a deux faces, deux bords." },
    hint: { tr: "Sürükle: döndür · Kaydır ya da iki parmak: yakınlaştır", en: "Drag: rotate · Scroll or pinch: zoom", fr: "Glisser : tourner · Molette ou pincer : zoomer" }
  };
  var M = P.create(host, { label: T(L.label), distance: 8.5, pitch: 0.55, yaw: 0.4 });
  var THREE = M.THREE, pal = M.pal, ui = P.controls(document.getElementById("model-panel"));
  var hint = document.createElement("p"); hint.className = "model-hint"; hint.textContent = T(L.hint); host.appendChild(hint);

  var R = 2.1, w = 0.75, wf = 1, halfTwists = 1, radiusScale = 1;
  function pt(u, v, k, rad) { // u in [0, 2π], v in [-1, 1]; k half twists
    var a = k * u / 2, ww = w * wf, r = rad + v * ww * Math.cos(a);
    return [r * Math.cos(u), r * Math.sin(u), v * ww * Math.sin(a)];
  }
  var matA = new THREE.MeshStandardMaterial({ color: pal.surface, roughness: 0.6, metalness: 0.02, side: THREE.DoubleSide, transparent: true });
  var mesh = null, edgeMesh = null;
  function build() {
    if (mesh) { M.root.remove(mesh); mesh.geometry.dispose(); }
    var segU = 240 * Math.max(1, halfTwists / 2);
    mesh = P.surface(function (s, t) { return pt(s * Math.PI * 2, t * 2 - 1, halfTwists, R * radiusScale); }, segU, 16, matA);
    M.root.add(mesh);
    if (edgeMesh) { M.root.remove(edgeMesh); edgeMesh.geometry.dispose(); edgeMesh = null; }
    if (showEdge) addEdge();
  }
  var showEdge = false;
  function addEdge() {
    var k = halfTwists, rad = R * radiusScale;
    if (k % 2 === 1) { // one edge: v = +1 run over u in [0, 4π]
      edgeMesh = P.tube(function (t) { return pt(t * 2, 1, k, rad); }, 0.05, pal.R, 600);
    } else { // two edges
      edgeMesh = new THREE.Group();
      edgeMesh.add(P.tube(function (t) { return pt(t, 1, k, rad); }, 0.05, pal.R, 400));
      edgeMesh.add(P.tube(function (t) { return pt(t, -1, k, rad); }, 0.05, pal.S, 400));
      edgeMesh.geometry = { dispose: function () {} };
    }
    M.root.add(edgeMesh);
  }

  // ant: travels along the centre line, offset along the (continuous) surface normal
  var ant = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), new THREE.MeshStandardMaterial({ color: pal.ink, roughness: 0.4 }));
  var trailMax = 900, trailPos = new Float32Array(trailMax * 3), trailN = 0;
  var trailGeo = new THREE.BufferGeometry(); trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
  var trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: pal.accent }));
  M.root.add(ant); M.root.add(trail); ant.visible = false; trail.visible = false;
  var walking = false, au = 0;
  function normalAt(u) {
    var k = halfTwists, rad = R * radiusScale, e = 1e-3;
    var p = pt(u, 0, k, rad), pu = pt(u + e, 0, k, rad), pv = pt(u, e, k, rad);
    var du = new THREE.Vector3(pu[0] - p[0], pu[1] - p[1], pu[2] - p[2]);
    // continuous across tours: v-direction is computed from the angle a = k u / 2 without reducing u
    var a = k * u / 2, dv = new THREE.Vector3(Math.cos(a) * Math.cos(u), Math.cos(a) * Math.sin(u), Math.sin(a));
    return { p: p, n: du.cross(dv).normalize() };
  }
  M.onFrame(function (dt) {
    if (!walking) return;
    au += dt * 0.9; var maxU = Math.PI * 2 * (halfTwists % 2 ? 2 : 1);
    if (au > maxU) { au = maxU; walking = false; bWalk.textContent = T(L.walk); }
    var q = normalAt(au), pos = new THREE.Vector3(q.p[0], q.p[1], q.p[2]).addScaledVector(q.n, 0.14);
    ant.position.copy(pos);
    if (trailN < trailMax) { trailPos[trailN * 3] = pos.x; trailPos[trailN * 3 + 1] = pos.y; trailPos[trailN * 3 + 2] = pos.z; trailN++; trailGeo.setDrawRange(0, trailN); trailGeo.attributes.position.needsUpdate = true; }
  });
  function startWalk() {
    walking = !walking; bWalk.textContent = walking ? T(L.stop) : T(L.walk);
    if (walking && (au === 0 || au >= Math.PI * 2 * (halfTwists % 2 ? 2 : 1))) { au = 0; trailN = 0; trailGeo.setDrawRange(0, 0); }
    ant.visible = trail.visible = true; if (walking && halfTwists === 1) ui.status(T(L.sWalk)); M.stopAuto();
  }
  function setShape(k, scale, msg, widthFactor) {
    P.tween(M, 500, function (e) { matA.opacity = 1 - e; }, function () {
      halfTwists = k; radiusScale = scale; wf = widthFactor || 1; walking = false; au = 0; trailN = 0; trailGeo.setDrawRange(0, 0); ant.visible = false; bWalk.textContent = T(L.walk);
      build(); P.tween(M, 600, function (e) { matA.opacity = e; });
    });
    ui.status(msg);
  }

  var g = ui.group();
  var bWalk = ui.button(T(L.walk), startWalk); g.appendChild(bWalk);
  var bEdge = ui.button(T(L.edge), function (b) {
    showEdge = !showEdge; b.setAttribute("aria-pressed", String(showEdge));
    if (edgeMesh) { M.root.remove(edgeMesh); edgeMesh = null; } if (showEdge) { addEdge(); ui.status(halfTwists % 2 ? T(L.sEdge) : T(L.sBand)); }
  }, { pressed: false }); g.appendChild(bEdge);
  var bCut = ui.button(T(L.cut), function () { if (halfTwists === 1) setShape(4, 1.35, T(L.sCut), 0.5); }); g.appendChild(bCut);
  var bBand = ui.button(T(L.band), function () { setShape(0, 1, T(L.sBand)); }); g.appendChild(bBand);
  var bReset = ui.button(T(L.reset), function () { setShape(1, 1, T(L.s0)); }); g.appendChild(bReset);
  var g2 = ui.group();
  g2.appendChild(ui.slider(T(L.width), 0.3, 1.1, 0.05, w, function (v) { w = v; build(); }).parentNode);

  build(); ui.status(T(L.s0));
})();
