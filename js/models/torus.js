/* Lacan'ın talep ve arzu torusu: talep tüpün çevresinde döner, arzu deliğin çevresinde,
   ancak talepler tamamlandığında sayılabilen bir tur çizer. İkinci kip: özne ile Başka'nın iç içe geçmiş torusları. */
(function () {
  "use strict";
  var P = window.PsyModel, T = P.t;
  var host = document.getElementById("model");
  var L = {
    label: { tr: "Talep ve arzu torusunun döndürülebilir üç boyutlu modeli", en: "Rotatable three-dimensional model of the torus of demand and desire", fr: "Modèle tridimensionnel orientable du tore de la demande et du désir" },
    play: { tr: "Talepleri başlat", en: "Start the demands", fr: "Lancer les demandes" },
    pause: { tr: "Duraklat", en: "Pause", fr: "Pause" },
    coils: { tr: "Bir turdaki talep", en: "Demands per tour", fr: "Demandes par tour" },
    one: { tr: "Tek torus", en: "One torus", fr: "Un tore" },
    two: { tr: "Özne ve Başka", en: "Subject and Other", fr: "Sujet et Autre" },
    dem: { tr: "Talep (tüpün çevresinde)", en: "Demand (round the tube)", fr: "Demande (autour du tube)" },
    des: { tr: "Arzu (deliğin çevresinde)", en: "Desire (round the hole)", fr: "Désir (autour du trou)" },
    s0: { tr: "Bir torus, yani bir simit yüzeyi. Talepleri başlatın: Nokta her seferinde tüpün çevresinde bir tur atar; bu turlar talebin, yinelenen, her seferinde aynı noktaya dönen hareketidir.", en: "A torus, a ring-shaped surface. Start the demands: each time the point goes once round the tube; these loops are the movement of demand, repeated, returning each time to the same point.", fr: "Un tore, une surface en forme d'anneau. Lancez les demandes : chaque fois, le point fait un tour autour du tube ; ces boucles sont le mouvement de la demande, répétée, revenant chaque fois au même point." },
    s1: { tr: "Talep turlarının toplamı, fark edilmeden, deliğin çevresinde bir tur çizdi. Lacan'a göre arzu budur: hiçbir talebin içinde görünmeyen, ama taleplerin bütünü tarafından çizilen, merkezdeki boşluğun çevresindeki tur. Delik, arzunun nesnesinin değil, eksikliğinin yeridir.", en: "Without anyone noticing, the sum of the demand loops has traced one tour round the hole. For Lacan this is desire: a tour round the central void that appears in no single demand but is drawn by the demands as a whole. The hole is the place not of desire's object but of its lack.", fr: "Sans qu'on s'en aperçoive, la somme des boucles de la demande a tracé un tour autour du trou. Pour Lacan, c'est cela le désir : un tour autour du vide central qui n'apparaît dans aucune demande, mais que l'ensemble des demandes dessine. Le trou est le lieu non de l'objet du désir, mais de son manque." },
    s2: { tr: "İki torus birbirinin içinden geçiyor. Vurgulu iki çember aynı hareketin iki yüzüdür: Öznenin tüpün çevresindeki bir talebi, Başka'nın torusunda deliğin çevresinde bir tur, yani onun arzusudur. Lacan, öznenin talebinin Başka'nın arzusuna, öznenin arzusunun da Başka'nın talebine denk geldiğini bu biçimde gösterdi.", en: "Two tori pass through each other. The two highlighted circles are two faces of the same movement: one demand of the subject, round its tube, is on the Other's torus a tour round the hole, that is, its desire. Lacan showed in this way that the subject's demand corresponds to the Other's desire, and the subject's desire to the Other's demand.", fr: "Deux tores passent l'un dans l'autre. Les deux cercles mis en évidence sont deux faces du même mouvement : une demande du sujet, autour de son tube, est sur le tore de l'Autre un tour autour du trou, c'est-à-dire son désir. Lacan a montré ainsi que la demande du sujet correspond au désir de l'Autre, et le désir du sujet à la demande de l'Autre." },
    hint: { tr: "Sürükle: döndür · Kaydır ya da iki parmak: yakınlaştır", en: "Drag: rotate · Scroll or pinch: zoom", fr: "Glisser : tourner · Molette ou pincer : zoomer" }
  };
  var M = P.create(host, { label: T(L.label), distance: 9, pitch: 0.7, yaw: 0.3 });
  var THREE = M.THREE, pal = M.pal, ui = P.controls(document.getElementById("model-panel"));
  var hint = document.createElement("p"); hint.className = "model-hint"; hint.textContent = T(L.hint); host.appendChild(hint);

  var R1 = 2.2, r1 = 0.8;
  function torusPt(Rm, rm, th, ph) { var c = Rm + rm * Math.cos(ph); return [c * Math.cos(th), c * Math.sin(th), rm * Math.sin(ph)]; }
  var mat1 = new THREE.MeshStandardMaterial({ color: pal.surface, roughness: 0.55, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false });
  var t1 = P.surface(function (u, v) { return torusPt(R1, r1, u * Math.PI * 2, v * Math.PI * 2); }, 120, 48, mat1); M.root.add(t1);

  // second torus (the Other): core circle in the XZ plane centred on (R1,0,0), around the first torus's tube
  var R2 = 1.6, r2 = 0.42, other = new THREE.Group(); other.position.set(R1, 0, 0); other.rotation.x = Math.PI / 2;
  var mat2 = new THREE.MeshStandardMaterial({ color: pal.S, roughness: 0.55, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false });
  other.add(P.surface(function (u, v) { return torusPt(R2, r2, u * Math.PI * 2, v * Math.PI * 2); }, 100, 36, mat2));
  other.visible = false; M.root.add(other);
  var meridian = P.tube(function (t) { return torusPt(R1, r1 + 0.02, 0, t); }, 0.035, pal.R, 120);
  var longitude2 = P.tube(function (t) { var p = torusPt(R2, 0, t, 0); return [R1 + p[0], p[2], p[1]]; }, 0.035, pal.R, 200);
  meridian.visible = longitude2.visible = false; M.root.add(meridian); M.root.add(longitude2);

  // the demand path: n loops round the tube while going once round the hole
  var n = 6, progress = 0, playing = false;
  var dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 14), new THREE.MeshStandardMaterial({ color: pal.accent }));
  M.root.add(dot);
  var maxPts = 1600, pathPos = new Float32Array(maxPts * 3), pathGeo = new THREE.BufferGeometry();
  pathGeo.setAttribute("position", new THREE.BufferAttribute(pathPos, 3));
  var path = new THREE.Line(pathGeo, new THREE.LineBasicMaterial({ color: pal.accent })); M.root.add(path);
  var holeRing = P.tube(function (t) { return torusPt(R1, 0, t, 0); }, 0.03, pal.I, 240); holeRing.visible = false; M.root.add(holeRing);
  function at(p) { var th = p * Math.PI * 2, ph = n * th; var q = torusPt(R1, r1 + 0.03, th, ph); return q; }
  function redrawPath() {
    var k = Math.max(2, Math.floor(progress * maxPts));
    for (var i = 0; i < k; i++) { var q = at(progress * i / (k - 1)); pathPos[i * 3] = q[0]; pathPos[i * 3 + 1] = q[1]; pathPos[i * 3 + 2] = q[2]; }
    pathGeo.setDrawRange(0, k); pathGeo.attributes.position.needsUpdate = true;
    var d = at(progress); dot.position.set(d[0], d[1], d[2]);
    counter.textContent = T(L.dem) + ": " + Math.floor(progress * n + 1e-6) + " · " + T(L.des) + ": " + Math.floor(progress + 1e-6);
  }
  M.onFrame(function (dt) {
    if (!playing) return;
    progress = Math.min(1, progress + dt * 0.055);
    redrawPath();
    if (progress >= 1) { playing = false; bPlay.textContent = T(L.play); holeRing.visible = true; ui.status(T(L.s1)); }
  });

  var g = ui.group();
  var bPlay = ui.button(T(L.play), function () {
    if (progress >= 1) { progress = 0; holeRing.visible = false; ui.status(T(L.s0)); }
    playing = !playing; bPlay.textContent = playing ? T(L.pause) : T(L.play); M.stopAuto();
  }); g.appendChild(bPlay);
  var bOne = ui.button(T(L.one), function () { setTwo(false); }, { pressed: true }); g.appendChild(bOne);
  var bTwo = ui.button(T(L.two), function () { setTwo(true); }, { pressed: false }); g.appendChild(bTwo);
  var g2 = ui.group();
  g2.appendChild(ui.slider(T(L.coils), 1, 14, 1, n, function (v) { n = v; progress = 0; holeRing.visible = false; redrawPath(); }).parentNode);
  var counter = document.createElement("p"); counter.className = "model-status"; counter.style.borderLeftColor = "transparent"; counter.style.minHeight = "0";
  document.getElementById("model-panel").appendChild(counter);

  function setTwo(on) {
    bOne.setAttribute("aria-pressed", String(!on)); bTwo.setAttribute("aria-pressed", String(on));
    other.visible = meridian.visible = longitude2.visible = on; path.visible = dot.visible = !on; holeRing.visible = !on && progress >= 1;
    playing = false; bPlay.textContent = T(L.play); bPlay.hidden = on; g2.hidden = on; counter.hidden = on;
    ui.status(on ? T(L.s2) : T(L.s0)); M.setView(on ? 0.9 : 0.3, on ? 0.35 : 0.7, on ? 10 : 9);
  }
  redrawPath(); ui.status(T(L.s0));
})();
