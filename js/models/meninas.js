/* Las Meninas'ın şematik perspektif odası: özne noktası S, resim düzlemi, kaçış noktası,
   arka duvardaki ayna ve kapı, ressam ile tuvali arasındaki aralık. Lacan'ın 18 Mayıs 1966 dersine eşlik eder. */
(function () {
  "use strict";
  var P = window.PsyModel, T = P.t;
  var host = document.getElementById("model");
  var L = {
    label: { tr: "Las Meninas'ın şematik perspektif odasının üç boyutlu modeli", en: "Three-dimensional model of the schematic perspective room of Las Meninas", fr: "Modèle tridimensionnel de la chambre perspective schématique des Ménines" },
    sx: { tr: "S: yatay", en: "S: horizontal", fr: "S : horizontal" }, sy: { tr: "S: yükseklik", en: "S: height", fr: "S : hauteur" }, sz: { tr: "S: uzaklık", en: "S: distance", fr: "S : distance" },
    vel: { tr: "Velázquez'in kaçış noktası", en: "Velázquez's vanishing point", fr: "Le point de fuite de Velázquez" },
    rays: { tr: "Görüş çizgileri", en: "Lines of sight", fr: "Lignes de visée" },
    mirror: { tr: "Ayna okuması (Foucault)", en: "Mirror reading (Foucault)", fr: "Lecture du miroir (Foucault)" },
    window: { tr: "Pencere okuması (Lacan)", en: "Window reading (Lacan)", fr: "Lecture de la fenêtre (Lacan)" },
    names: { tr: "Adlar", en: "Names", fr: "Noms" },
    nS: { tr: "S: özne noktası", en: "S: subject point", fr: "S : point sujet" }, nVP: { tr: "kaçış noktası", en: "vanishing point", fr: "point de fuite" },
    nMir: { tr: "ayna", en: "mirror", fr: "miroir" }, nDoor: { tr: "kapıdaki adam", en: "man in the door", fr: "l'homme à la porte" },
    nPainter: { tr: "ressam", en: "painter", fr: "peintre" }, nCanvas: { tr: "tuvalin arkası", en: "back of the canvas", fr: "dos de la toile" },
    nPlane: { tr: "resim düzlemi", en: "picture plane", fr: "plan du tableau" }, nKing: { tr: "kral ve kraliçe?", en: "king and queen?", fr: "le roi et la reine ?" },
    s0: { tr: "Şematik bir oda: önde resim düzlemi, onun önünde özne noktası S, arka duvarda ayna ve açık kapı. Kırmızı çizgiler, odanın S'den bakıldığında resim düzlemine düşen izdüşümüdür. S'yi hareket ettirin: Derinliğe giden bütün çizgiler, S'nin resim düzlemindeki izi olan tek bir kaçış noktasında birleşir.", en: "A schematic room: in front the picture plane, before it the subject point S, on the back wall the mirror and the open door. The red lines are the projection of the room onto the picture plane as seen from S. Move S: all the lines running into depth meet at a single vanishing point, the trace of S on the picture plane.", fr: "Une chambre schématique : devant, le plan du tableau ; devant lui, le point sujet S ; au mur du fond, le miroir et la porte ouverte. Les lignes rouges sont la projection de la pièce sur le plan du tableau vue depuis S. Déplacez S : toutes les lignes qui fuient en profondeur se rejoignent en un seul point de fuite, la trace de S sur le plan du tableau." },
    sVel: { tr: "Las Meninas'ta kaçış noktası arka duvardaki açık kapının içinde, ışığa doğru giden adamın hizasına düşer. Lacan'ın deyişiyle S, resmin kurulması için gerekli olan ama resmin içinde yalnızca bir iz olarak, ufuk çizgisindeki bir nokta olarak görünen öznedir.", en: "In Las Meninas the vanishing point falls within the open door on the back wall, at the level of the man going towards the light. In Lacan's terms S is the subject necessary for the construction of the picture, which appears within the picture only as a trace, as a point on the horizon line.", fr: "Dans Les Ménines, le point de fuite tombe dans la porte ouverte du mur du fond, à la hauteur de l'homme qui va vers la lumière. Dans les termes de Lacan, S est le sujet nécessaire à la construction du tableau, qui n'apparaît dans le tableau que comme une trace, comme un point de la ligne d'horizon." },
    sMir: { tr: "Foucault'nun okumasında tablonun anahtarı aynadır: Arka duvardaki ayna, resmin önündeki yeri, kral ile kraliçenin, yani bakanın yerini yansıtır. Temsil, bu görünmeyen merkezin çevresinde düzenlenir.", en: "In Foucault's reading the key to the painting is the mirror: the mirror on the back wall reflects the place in front of the picture, that of the king and queen, that is, of the viewer. Representation is ordered around this invisible centre.", fr: "Dans la lecture de Foucault, la clé du tableau est le miroir : le miroir du mur du fond reflète la place devant le tableau, celle du roi et de la reine, c'est-à-dire du spectateur. La représentation s'ordonne autour de ce centre invisible." },
    sWin: { tr: "Lacan'ın okumasında anahtar penceredir: Resim düzlemi ile özne noktası arasındaki aralık (vurgulu hacim) ve ressam ile tuvali arasındaki mesafe (vurgulu çizgi). Ressam fırçasıyla tuvaline uzanamaz. Bakış, aynada yakalanmaz; gözlerimizi açarak kendimizin kurduğu penceredir.", en: "In Lacan's reading the key is the window: the interval between the picture plane and the subject point (the highlighted volume) and the distance between the painter and his canvas (the highlighted line). The painter cannot reach his canvas with his brush. The gaze is not caught in the mirror; it is the window we ourselves constitute by opening our eyes.", fr: "Dans la lecture de Lacan, la clé est la fenêtre : l'intervalle entre le plan du tableau et le point sujet (le volume mis en évidence) et la distance entre le peintre et sa toile (la ligne mise en évidence). Le peintre ne peut atteindre sa toile de son pinceau. Le regard ne se saisit pas dans le miroir ; il est la fenêtre que nous constituons nous-mêmes en ouvrant les yeux." },
    hint: { tr: "Sürükle: döndür · Kaydır ya da iki parmak: yakınlaştır · Şematiktir, ölçekli değildir", en: "Drag: rotate · Scroll or pinch: zoom · Schematic, not to scale", fr: "Glisser : tourner · Molette ou pincer : zoomer · Schématique, pas à l'échelle" }
  };
  var M = P.create(host, { label: T(L.label), distance: 18, pitch: 0.32, yaw: -0.42, target: new THREE.Vector3(0, 1.9, -2), maxDistance: 34, autoRotate: false });
  var THREE_ = M.THREE, pal = M.pal, ui = P.controls(document.getElementById("model-panel"));
  var hint = document.createElement("p"); hint.className = "model-hint"; hint.textContent = T(L.hint); host.appendChild(hint);
  var V = function (x, y, z) { return new THREE_.Vector3(x, y, z); };

  // room
  var W = 3, H = 4.6, D = 9;
  var wallMat = new THREE_.MeshStandardMaterial({ color: pal.surface, roughness: 0.9, side: THREE_.DoubleSide, transparent: true, opacity: 0.32, depthWrite: false });
  function quad(a, b, c, d, mat) {
    var g = new THREE_.BufferGeometry(); g.setFromPoints([a, b, c, a, c, d]); g.computeVertexNormals(); var m = new THREE_.Mesh(g, mat); M.root.add(m); return m;
  }
  quad(V(-W, 0, -D), V(W, 0, -D), V(W, H, -D), V(-W, H, -D), new THREE_.MeshStandardMaterial({ color: pal.surface, roughness: 0.9, side: THREE_.DoubleSide }));
  quad(V(-W, 0, 0), V(W, 0, 0), V(W, 0, -D), V(-W, 0, -D), wallMat);
  quad(V(-W, 0, 0), V(-W, 0, -D), V(-W, H, -D), V(-W, H, 0), wallMat);
  quad(V(W, 0, 0), V(W, 0, -D), V(W, H, -D), V(W, H, 0), wallMat);
  var edgeMat = new THREE_.LineBasicMaterial({ color: pal.ink3 });
  var segs3D = []; // 3D segments that get projected onto the picture plane
  function seg(a, b, show) { segs3D.push([a, b]); if (show !== false) { var g = new THREE_.BufferGeometry().setFromPoints([a, b]); M.root.add(new THREE_.Line(g, edgeMat)); } }
  [[-W, 0], [W, 0], [-W, H], [W, H]].forEach(function (c) { seg(V(c[0], c[1], 0), V(c[0], c[1], -D)); });
  seg(V(-W, 0, -D), V(W, 0, -D)); seg(V(-W, H, -D), V(W, H, -D)); seg(V(-W, 0, -D), V(-W, H, -D)); seg(V(W, 0, -D), V(W, H, -D));
  // floor tiles along depth, to make convergence visible
  [-1.5, 0, 1.5].forEach(function (x) { seg(V(x, 0, 0), V(x, 0, -D)); });
  // back wall: mirror and door
  var mir = { x: -0.45, y: 2.05, w: 0.6, h: 0.8 }, door = { x: 0.55, w: 0.8, h: 2.8 };
  var mirMesh = quad(V(mir.x, mir.y, -D + 0.02), V(mir.x + mir.w, mir.y, -D + 0.02), V(mir.x + mir.w, mir.y + mir.h, -D + 0.02), V(mir.x, mir.y + mir.h, -D + 0.02),
    new THREE_.MeshStandardMaterial({ color: 0xe9edf2, roughness: 0.15, metalness: 0.6, side: THREE_.DoubleSide }));
  quad(V(door.x, 0, -D + 0.02), V(door.x + door.w, 0, -D + 0.02), V(door.x + door.w, door.h, -D + 0.02), V(door.x, door.h, -D + 0.02), new THREE_.MeshBasicMaterial({ color: 0xfff2c8, side: THREE_.DoubleSide }));
  [[mir.x, mir.y, mir.x + mir.w, mir.y], [mir.x + mir.w, mir.y, mir.x + mir.w, mir.y + mir.h], [mir.x + mir.w, mir.y + mir.h, mir.x, mir.y + mir.h], [mir.x, mir.y + mir.h, mir.x, mir.y],
   [door.x, 0, door.x, door.h], [door.x, door.h, door.x + door.w, door.h], [door.x + door.w, door.h, door.x + door.w, 0]].forEach(function (s) { seg(V(s[0], s[1], -D + 0.03), V(s[2], s[3], -D + 0.03)); });

  // figures (simple capsules)
  function figure(x, z, h, color) {
    var g = new THREE_.Group(), m = new THREE_.MeshStandardMaterial({ color: color, roughness: 0.7 });
    var body = new THREE_.Mesh(new THREE_.CylinderGeometry(0.22 * h / 1.8, 0.32 * h / 1.8, h * 0.78, 16), m); body.position.y = h * 0.39; g.add(body);
    var head = new THREE_.Mesh(new THREE_.SphereGeometry(0.15 * h / 1.8, 16, 12), m); head.position.y = h * 0.88; g.add(head);
    g.position.set(x, 0, z); M.root.add(g); return g;
  }
  var nieto = figure(door.x + 0.4, -D - 0.6, 1.8, pal.ink3); nieto.position.y = 0.55;
  var painter = figure(-0.75, -2.7, 1.85, pal.ink);
  figure(0.25, -3.2, 1.05, pal.I); figure(-0.35, -3.5, 1.3, pal.ink3); figure(0.95, -3.4, 1.35, pal.ink3);
  // the huge canvas, its back turned to us
  var canvasG = new THREE_.Group(); canvasG.position.set(-2.05, 0, -1.7); canvasG.rotation.y = -0.18; M.root.add(canvasG);
  var cv = new THREE_.Mesh(new THREE_.BoxGeometry(1.5, 3.6, 0.06), new THREE_.MeshStandardMaterial({ color: 0xa88b62, roughness: 0.85 })); cv.position.y = 1.85; canvasG.add(cv);
  [[0, 1.85, 1.5, 0.08], [0, 0.1, 1.5, 0.08], [0, 3.6, 1.5, 0.08], [-0.72, 1.85, 0.08, 3.6], [0.72, 1.85, 0.08, 3.6]].forEach(function (b) {
    var bar = new THREE_.Mesh(new THREE_.BoxGeometry(b[2], b[3], 0.07), new THREE_.MeshStandardMaterial({ color: 0x6d5434 })); bar.position.set(b[0], b[1], 0.07); canvasG.add(bar);
  });

  // picture plane frame (z = 0)
  var planeFrame = new THREE_.LineLoop(new THREE_.BufferGeometry().setFromPoints([V(-W, 0, 0), V(W, 0, 0), V(W, H, 0), V(-W, H, 0)]), new THREE_.LineBasicMaterial({ color: pal.ink }));
  M.root.add(planeFrame);

  // subject point S and the projection
  var Sp = V(0, 1.7, 6);
  var sMesh = new THREE_.Mesh(new THREE_.SphereGeometry(0.13, 20, 14), new THREE_.MeshStandardMaterial({ color: pal.accent })); M.root.add(sMesh);
  var vpMesh = new THREE_.Mesh(new THREE_.SphereGeometry(0.08, 16, 12), new THREE_.MeshBasicMaterial({ color: pal.R })); M.root.add(vpMesh);
  var projGeo = new THREE_.BufferGeometry(), projPos = new Float32Array(segs3D.length * 6 + 12);
  projGeo.setAttribute("position", new THREE_.BufferAttribute(projPos, 3));
  var proj = new THREE_.LineSegments(projGeo, new THREE_.LineBasicMaterial({ color: pal.R })); M.root.add(proj);
  var rayGeo = new THREE_.BufferGeometry(), rayPos = new Float32Array(8 * 6);
  rayGeo.setAttribute("position", new THREE_.BufferAttribute(rayPos, 3));
  var rays = new THREE_.LineSegments(rayGeo, new THREE_.LineDashedMaterial({ color: pal.ink3, dashSize: 0.2, gapSize: 0.15 })); rays.visible = false; M.root.add(rays);
  var horizon = new THREE_.Line(new THREE_.BufferGeometry().setFromPoints([V(-W, 0, 0.01), V(W, 0, 0.01)]), new THREE_.LineBasicMaterial({ color: pal.R })); M.root.add(horizon);
  function project(p) { var l = Sp.z / (Sp.z - p.z); return V(Sp.x + (p.x - Sp.x) * l, Sp.y + (p.y - Sp.y) * l, 0.005); }
  function clipPlane(p) { return p; }
  function update() {
    sMesh.position.copy(Sp); vpMesh.position.set(Sp.x, Sp.y, 0.01);
    var i = 0;
    segs3D.forEach(function (s) { var a = project(s[0]), b = project(s[1]); projPos.set([a.x, a.y, a.z, b.x, b.y, b.z], i); i += 6; });
    projGeo.setDrawRange(0, i / 3); projGeo.attributes.position.needsUpdate = true;
    horizon.geometry.setFromPoints([V(-W, Sp.y, 0.01), V(W, Sp.y, 0.01)]);
    var corners = [V(-W, 0, -D), V(W, 0, -D), V(W, H, -D), V(-W, H, -D)], k = 0;
    corners.forEach(function (c) { rayPos.set([Sp.x, Sp.y, Sp.z, c.x, c.y, c.z], k); k += 6; });
    rayPos.set([Sp.x, Sp.y, Sp.z, Sp.x, Sp.y, -D], k); k += 6;
    rayGeo.setDrawRange(0, k / 3); rayGeo.attributes.position.needsUpdate = true; rays.computeLineDistances();
    labS.position.set(Sp.x, Sp.y + 0.45, Sp.z); labVP.position.set(Sp.x, Sp.y + 0.35, 0.05);
    slab.scale.set(1, 1, Math.max(0.01, Sp.z)); slab.position.z = Sp.z / 2;
  }

  // Foucault: mirror ↔ the place in front (king and queen)
  var king = V(mir.x + mir.w / 2, 1.75, 3.2);
  var mirrorLine = new THREE_.Line(new THREE_.BufferGeometry().setFromPoints([V(king.x, mir.y + mir.h / 2, -D + 0.05), king]), new THREE_.LineDashedMaterial({ color: pal.S, dashSize: 0.25, gapSize: 0.15 }));
  mirrorLine.computeLineDistances(); mirrorLine.visible = false; M.root.add(mirrorLine);
  var kingMesh = new THREE_.Group(); kingMesh.add(figure(king.x - 0.25, king.z, 1.75, pal.S)); kingMesh.add(figure(king.x + 0.25, king.z, 1.65, pal.S));
  kingMesh.children.forEach(function (c) { M.root.remove(c); }); M.root.add(kingMesh); kingMesh.visible = false;
  // Lacan: the interval between picture plane and S, and the painter–canvas distance
  var slab = new THREE_.Mesh(new THREE_.BoxGeometry(2 * W, H, 1), new THREE_.MeshBasicMaterial({ color: pal.accent, transparent: true, opacity: 0.09, depthWrite: false }));
  slab.position.set(0, H / 2, 0.5); slab.visible = false; M.root.add(slab);
  var gapLine = P.tube(function (t) { var a = V(-0.6, 1.45, -2.55), b = V(-1.32, 1.45, -1.78), f = (Math.sin(t) + 1) / 2; return [a.x + (b.x - a.x) * f, a.y, a.z + (b.z - a.z) * f]; }, 0.035, pal.accent, 40);
  gapLine.visible = false; M.root.add(gapLine);

  // labels
  var labS = P.label("S", pal.accent, 0.9), labVP = P.label("•", pal.R, 0.5); M.root.add(labS); M.root.add(labVP);
  var names = [];
  function nameAt(text, pos, color) {
    var c = document.createElement("canvas"); c.width = 512; c.height = 96; var x = c.getContext("2d");
    x.font = "italic 52px 'EB Garamond', Garamond, serif"; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillStyle = "#" + new THREE_.Color(color || pal.ink).getHexString(); x.fillText(text, 256, 50);
    var sp = new THREE_.Sprite(new THREE_.SpriteMaterial({ map: new THREE_.CanvasTexture(c), depthTest: false, transparent: true }));
    sp.scale.set(2.6, 0.49, 1); sp.position.copy(pos); sp.renderOrder = 11; sp.visible = false; M.root.add(sp); names.push(sp); return sp;
  }
  nameAt(T(L.nMir), V(mir.x - 0.9, mir.y + mir.h + 0.3, -D + 0.1));
  nameAt(T(L.nDoor), V(door.x + door.w + 1.1, door.h - 0.2, -D + 0.1));
  nameAt(T(L.nPainter), V(-0.75, 2.25, -2.7)); nameAt(T(L.nCanvas), V(-2.05, 3.95, -1.6));
  nameAt(T(L.nPlane), V(W - 1.2, H + 0.3, 0)); var nS = nameAt(T(L.nS), V(0, 0, 0), pal.accent);
  var nK = nameAt(T(L.nKing), V(king.x, 2.35, king.z), pal.S); M.onFrame(function () { nS.position.set(Sp.x, Sp.y + 0.9, Sp.z); nK.visible = showNames && kingMesh.visible; });

  // controls
  var g = ui.group(), sl = {};
  sl.x = ui.slider(T(L.sx), -2.5, 2.5, 0.05, Sp.x, function (v) { Sp.x = v; update(); });
  sl.y = ui.slider(T(L.sy), 0.4, 3.8, 0.05, Sp.y, function (v) { Sp.y = v; update(); });
  sl.z = ui.slider(T(L.sz), 1.5, 10, 0.1, Sp.z, function (v) { Sp.z = v; update(); });
  [sl.x, sl.y, sl.z].forEach(function (s) { g.appendChild(s.parentNode); });
  var g2 = ui.group();
  g2.appendChild(ui.button(T(L.vel), function () {
    var from = Sp.clone(), to = V(door.x + door.w / 2, 1.95, Sp.z);
    P.tween(M, 900, function (e) { Sp.lerpVectors(from, to, e); [[sl.x, Sp.x], [sl.y, Sp.y]].forEach(function (q) { q[0].value = q[1].toFixed(2); q[0].nextSibling.textContent = q[1].toFixed(2); }); update(); });
    ui.status(T(L.sVel)); M.setView(-0.15, 0.12, 15);
  }));
  g2.appendChild(ui.button(T(L.rays), function (b) { rays.visible = !rays.visible; b.setAttribute("aria-pressed", String(rays.visible)); }, { pressed: false }));
  var bMir = ui.button(T(L.mirror), function (b) {
    var on = !mirrorLine.visible; mirrorLine.visible = kingMesh.visible = on; b.setAttribute("aria-pressed", String(on));
    if (on) { ui.status(T(L.sMir)); M.setView(-1.2, 0.25, 19); }
  }, { pressed: false }); g2.appendChild(bMir);
  var bWin = ui.button(T(L.window), function (b) {
    var on = !slab.visible; slab.visible = gapLine.visible = on; b.setAttribute("aria-pressed", String(on));
    if (on) { ui.status(T(L.sWin)); M.setView(-0.95, 0.3, 16); }
  }, { pressed: false }); g2.appendChild(bWin);
  var showNames = false;
  g2.appendChild(ui.button(T(L.names), function (b) { showNames = !showNames; b.setAttribute("aria-pressed", String(showNames)); names.forEach(function (n) { n.visible = showNames; }); }, { pressed: false }));
  update(); ui.status(T(L.s0));
})();
