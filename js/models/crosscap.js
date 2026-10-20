/* Çapraz başlık (projektif düzlem): bir disk çıkarıldığında geriye bir Möbius şeridi kalır.
   Lacan bu kesiği objet a (disk) ile bölünmüş özne ($, Möbius şeridi) arasındaki ayrım olarak okur. */
(function () {
  "use strict";
  var P = window.PsyModel, T = P.t;
  var host = document.getElementById("model");
  var L = {
    label: { tr: "Çapraz başlığın, yani projektif düzlemin, döndürülebilir üç boyutlu modeli", en: "Rotatable three-dimensional model of the cross-cap, the projective plane", fr: "Modèle tridimensionnel orientable du cross-cap, le plan projectif" },
    cut: { tr: "Diski kes ve ayır", en: "Cut the disc and lift it out", fr: "Couper le disque et le soulever" },
    join: { tr: "Yeniden birleştir", en: "Join again", fr: "Réunir" },
    wire: { tr: "Kendini kesen çizgiyi göster", en: "Show the self-intersection", fr: "Montrer l'auto-intersection" },
    size: { tr: "Disk büyüklüğü", en: "Disc size", fr: "Taille du disque" },
    letters: { tr: "a ve $ işaretleri", en: "Marks a and $", fr: "Lettres a et $" },
    s0: { tr: "Çapraz başlık, projektif düzlemin üç boyutlu uzaydaki bir görüntüsüdür. Kapalı, tek yüzlü bir yüzeydir ve üç boyutta kendini kesmeden çizilemez: Alttaki dikey çizgi, yüzeyin kendi içinden geçtiği yerdir. Renkli bölge bir disktir; diski kesin.", en: "The cross-cap is an image of the projective plane in three-dimensional space. It is a closed, one-sided surface that cannot be drawn in three dimensions without passing through itself: the vertical line below is where the surface goes through itself. The coloured region is a disc; cut the disc.", fr: "Le cross-cap est une image du plan projectif dans l'espace à trois dimensions. C'est une surface fermée, à une seule face, qu'on ne peut dessiner en trois dimensions sans qu'elle se traverse : la ligne verticale du bas est l'endroit où la surface passe à travers elle-même. La région colorée est un disque ; coupez le disque." },
    s1: { tr: "Disk ayrıldığında geriye kalan, bir Möbius şerididir: Projektif düzlemden hangi disk çıkarılırsa çıkarılsın, kalan her zaman tek yüzlü, tek kenarlı bir şerittir. Lacan bu kesiği, on üçüncü seminerden itibaren, objet a ile bölünmüş öznenin ayrılması olarak okudu: Disk, yüzeyden düşen nesnedir; Möbius şeridi, onun düşüşüyle yapılanan öznedir.", en: "Once the disc is removed, what remains is a Möbius strip: whatever disc is taken from the projective plane, what is left is always a one-sided strip with a single edge. From the thirteenth seminar onwards Lacan read this cut as the separation of the objet a from the divided subject: the disc is the object that falls from the surface; the Möbius strip is the subject structured by its fall.", fr: "Une fois le disque retiré, ce qui reste est un ruban de Möbius : quel que soit le disque ôté au plan projectif, ce qui reste est toujours un ruban à une face et à un seul bord. À partir du treizième séminaire, Lacan a lu cette coupure comme la séparation de l'objet a et du sujet divisé : le disque est l'objet qui choit de la surface ; le ruban de Möbius est le sujet que sa chute structure." },
    s2: { tr: "Kendini kesme çizgisi: Yüzey burada kendi içinden geçer. Bu, projektif düzlemin bir kusuru değil, onu üç boyuta sığdırmanın bedelidir; dört boyutta yüzey kendini kesmeden var olabilir.", en: "The line of self-intersection: here the surface passes through itself. This is not a flaw of the projective plane but the price of fitting it into three dimensions; in four dimensions the surface can exist without crossing itself.", fr: "La ligne d'auto-intersection : la surface s'y traverse elle-même. Ce n'est pas un défaut du plan projectif, mais le prix de son plongement en trois dimensions ; en quatre dimensions, la surface peut exister sans se traverser." },
    hint: { tr: "Sürükle: döndür · Kaydır ya da iki parmak: yakınlaştır", en: "Drag: rotate · Scroll or pinch: zoom", fr: "Glisser : tourner · Molette ou pincer : zoomer" }
  };
  var M = P.create(host, { label: T(L.label), distance: 8.6, pitch: 0.25, yaw: 0.5, target: new THREE.Vector3(0, 0.55, 0) });
  var THREE_ = M.THREE, pal = M.pal, ui = P.controls(document.getElementById("model-panel"));
  var hint = document.createElement("p"); hint.className = "model-hint"; hint.textContent = T(L.hint); host.appendChild(hint);

  // classic cross-cap: x = cos u sin 2v, y = sin u sin 2v, z = cos²v − cos²u sin²v, u∈[0,2π), v∈[0,π/2]
  var S = 2.2;
  function cc(u, v) { var s2 = Math.sin(2 * v), c = Math.cos(v), s = Math.sin(v), cu = Math.cos(u);
    return [S * Math.cos(u) * s2, S * (c * c - cu * cu * s * s) - 0.3, S * Math.sin(u) * s2]; } // z up -> y up
  var v0 = 0.42;
  var matM = new THREE_.MeshStandardMaterial({ color: pal.surface, roughness: 0.55, side: THREE_.DoubleSide });
  var matD = new THREE_.MeshStandardMaterial({ color: pal.accent, roughness: 0.5, side: THREE_.DoubleSide });
  var disc = null, mob = null, wire = null, discG = new THREE_.Group(); M.root.add(discG);
  function build() {
    if (disc) { discG.remove(disc); disc.geometry.dispose(); } if (mob) { M.root.remove(mob); mob.geometry.dispose(); }
    disc = P.surface(function (a, b) { return cc(a * Math.PI * 2, b * v0); }, 96, 14, matD); discG.add(disc);
    mob = P.surface(function (a, b) { return cc(a * Math.PI * 2, v0 + b * (Math.PI / 2 - v0)); }, 160, 60, matM); M.root.add(mob);
  }
  // the self-intersection segment (v = π/2 collapses onto it)
  wire = P.tube(function (t) { var z = (Math.cos(t) + 1) / 2; return [0, -S * z - 0.3, 0]; }, 0.035, pal.R, 60); wire.visible = false; M.root.add(wire);
  var la = P.label("a", pal.accent, 0.8), ls = P.label("$", pal.ink, 0.8); la.visible = ls.visible = false; M.root.add(la); M.root.add(ls);
  var lift = 0, liftT = 0, letters = false;
  M.onFrame(function (dt) {
    lift += (liftT - lift) * Math.min(1, dt * 3); discG.position.y = lift * 1.6;
    la.position.set(0, S - 0.3 + 0.35 + lift * 1.6, 0); ls.position.set(S * 0.95, -0.2, 0);
    la.visible = ls.visible = letters && liftT > 0;
  });

  var g = ui.group();
  var bCut = ui.button(T(L.cut), function () {
    if (liftT === 0) { liftT = 1; bCut.textContent = T(L.join); ui.status(T(L.s1)); }
    else { liftT = 0; bCut.textContent = T(L.cut); ui.status(T(L.s0)); }
    M.stopAuto();
  }); g.appendChild(bCut);
  var bWire = ui.button(T(L.wire), function (b) {
    wire.visible = !wire.visible; b.setAttribute("aria-pressed", String(wire.visible));
    matM.opacity = wire.visible ? 0.45 : 1; matM.transparent = wire.visible; matM.depthWrite = !wire.visible; matM.needsUpdate = true;
    if (wire.visible) ui.status(T(L.s2));
  }, { pressed: false }); g.appendChild(bWire);
  var bLet = ui.button(T(L.letters), function (b) { letters = !letters; b.setAttribute("aria-pressed", String(letters)); }, { pressed: false }); g.appendChild(bLet);
  var g2 = ui.group();
  g2.appendChild(ui.slider(T(L.size), 0.2, 0.75, 0.01, v0, function (v) { v0 = v; build(); }).parentNode);
  build(); ui.status(T(L.s0));
})();
