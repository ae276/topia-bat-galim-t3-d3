// Shared basement parking, levels −1 and −2 (sheets "מרתף -1 / -2", 1:200), traced from the PDF vectors.
// Stalls come from the drawn bay outlines and the dashed "V" bay markings; numbers are the circled bay numbers of the sheet.
export function buildParking(THREE, pk) {
  const PI = Math.PI;
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const KP = 0.07056, [CX, CY] = pk.center;                    // 1:200 → 1 pt = 7.056 cm
  const px = (x) => (x - CX) * KP, pz = (y) => (y - CY) * KP;
  const H = 2.9, FTF = 3.4;                                    // clear height / level-to-level (assumed — no section)
  const std = (name, color, roughness, metalness = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra }); m.name = name; return m; };
  const stripe = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = '#8c8d8c'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#d9d6cf'; g.lineWidth = 22;
    for (let i = -128; i < 256; i += 64) { g.beginPath(); g.moveTo(i, 128); g.lineTo(i + 128, 0); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(1 / 0.8, 1 / 0.8); return t;
  })();
  const M = {
    floor: std('epoxy_floor_grey', 0x8e9091, 0.42),
    wall: std('concrete_basement', 0xcac6be, 0.88),
    paint: std('road_paint_white', 0xf2f1ec, 0.6),
    ramp: std('ramp_hatched_concrete', 0xffffff, 0.8, 0, { map: stripe }),
    core: std('T3_core_lobby_highlight', 0xe2703a, 0.6, 0, { emissive: 0xe2703a, emissiveIntensity: 0.3 }),
    ghost: std('tower_footprint_ghost', 0xe2703a, 0.6, 0, { transparent: true, opacity: 0.16, depthWrite: false }),
    ghost4: std('T4_footprint_ghost', 0x8a8f94, 0.6, 0, { transparent: true, opacity: 0.12, depthWrite: false }),
    tire: std('tyre_rubber', 0x1b1b1b, 0.9), rim: std('wheel_rim', 0x9a9da0, 0.35, 0.4),
    carGlass: std('car_glass_tint', 0x1d2228, 0.08, 0.3), lamp: std('car_lamps', 0xf3efe6, 0.3, 0, { emissive: 0xfff4de, emissiveIntensity: 0.2 }),
    slabGhost: std('upper_level_slab_ghost', 0xbdb8ae, 0.9, 0, { transparent: true, opacity: 0.18, depthWrite: false }),
  };
  const paints = [['white', 0xe9e9e6], ['silver', 0xaaaeb2], ['graphite', 0x3a3d41], ['navy', 0x27354d], ['sand', 0xb8a78b], ['oxblood', 0x7c2c26], ['black', 0x161718]].map(([n, c]) => std('car_paint_' + n, c, 0.28, 0.35));
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach((p, i) => (i ? s.lineTo(px(p[0]), -pz(p[1])) : s.moveTo(px(p[0]), -pz(p[1])))); s.closePath(); return s; };
  const ext = (polys, h, y0, mat, name, parent) => {
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(polys.map(shape), { depth: h, bevelEnabled: false, curveSegments: 12 }), mat);
    m.rotation.x = -PI / 2; m.position.y = y0; m.name = name; parent.add(m); return m;
  };
  const rr = (w, d, h, r) => {
    const s = new THREE.Shape(); const x = w / 2 - r, z = d / 2 - r;
    s.moveTo(-x, -d / 2); s.lineTo(x, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, -z); s.lineTo(w / 2, z); s.quadraticCurveTo(w / 2, d / 2, x, d / 2);
    s.lineTo(-x, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, z); s.lineTo(-w / 2, -z); s.quadraticCurveTo(-w / 2, -d / 2, -x, -d / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth: h - 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 8 });
    g.rotateX(-PI / 2); g.translate(0, 0.04, 0); return g;
  };
  const G = {
    body: rr(4.55, 1.8, 0.62, 0.32), cabin: rr(2.45, 1.58, 0.56, 0.36), roof: rr(2.1, 1.5, 0.08, 0.3),
    wheel: new THREE.CylinderGeometry(0.33, 0.33, 0.22, 20).rotateX(PI / 2), rim: new THREE.CylinderGeometry(0.2, 0.2, 0.235, 14).rotateX(PI / 2),
    lamp: new THREE.BoxGeometry(0.06, 0.1, 1.5),
  };
  const car = (name, paint) => {
    const g = new THREE.Group(); g.name = name;
    const add = (n, geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.name = name + '_' + n; m.position.set(x, y, z); g.add(m); return m; };
    add('body', G.body, paint, 0, 0.24, 0); add('cabin_glass', G.cabin, M.carGlass, -0.25, 0.82, 0); add('roof', G.roof, paint, -0.35, 1.34, 0);
    [[1.45, 0.8], [1.45, -0.8], [-1.4, 0.8], [-1.4, -0.8]].forEach(([x, z], i) => { add('tyre' + i, G.wheel, M.tire, x, 0.33, z); add('rim' + i, G.rim, M.rim, x, 0.33, z); });
    add('lamps_front', G.lamp, M.lamp, 2.27, 0.66, 0);
    return g;
  };
  const numTex = {};
  const numMat = (n) => {
    if (numTex[n]) return numTex[n];
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = '#f2f1ec'; g.beginPath(); g.arc(64, 64, 58, 0, 2 * PI); g.fill(); g.lineWidth = 8; g.strokeStyle = '#2b2b2b'; g.stroke();
    g.fillStyle = '#2b2b2b'; g.font = '600 54px "IBM Plex Mono", ui-monospace, monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 64, 68);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return (numTex[n] = std('bay_number_' + n, 0xffffff, 0.7, 0, { map: t, transparent: true }));
  };

  const park = new THREE.Group(); park.name = 'TOPIA_parking_levels_-1_-2';
  const levels = {};
  let spaces = 0;
  for (const [lvl, L] of Object.entries(pk.levels)) {
    const g = new THREE.Group(); g.name = 'parking_level_' + lvl; park.add(g); levels[lvl] = g;
    ext([L.floor], 0.3, -0.3, M.floor, 'slab_epoxy_' + lvl, g);
    ext(L.walls, H, -0.01, M.wall, 'retaining_walls_columns_cores_' + lvl, g);
    ext(L.ramps, 0.02, 0, M.ramp, 'ramps_' + lvl, g);
    ext(L.arrows, 0.004, 0, M.paint, 'traffic_arrows_' + lvl, g);
    ext([pk.t3core], 0.012, 0, M.core, 'T3_core_lifts_lobby_' + lvl, g);
    const marks = new THREE.Group(); marks.name = 'bay_markings_' + lvl; g.add(marks);
    const cars = new THREE.Group(); cars.name = 'parked_cars_' + lvl; g.add(cars);
    const line = (name, cx, cz, len, ang, w = 0.1) => { const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.004, w), M.paint); m.name = name; m.position.set(cx, 0.003, cz); m.rotation.y = ang; marks.add(m); };
    L.stalls.forEach((s, i) => {
      const cx = px(s.p.reduce((a, q) => a + q[0], 0) / 4), cz = pz(s.p.reduce((a, q) => a + q[1], 0) / 4);
      const ang = -Math.atan2(s.u[1], s.u[0]);
      const dx = Math.cos(-ang), dz = Math.sin(-ang), wx = -dz, wz = dx;
      [-1, 1].forEach((sgn) => line('bay_' + i + '_side', cx + wx * (s.w / 2) * sgn, cz + wz * (s.w / 2) * sgn, s.d, ang));
      line('bay_' + i + '_back', cx + dx * (s.d / 2), cz + dz * (s.d / 2), s.w, ang + PI / 2);
      if (s.n) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), numMat(s.n)); m.name = 'bay_number_' + s.n; m.rotation.x = -PI / 2; m.position.set(cx + dx * (s.d * 0.18), 0.006, cz + dz * (s.d * 0.18)); marks.add(m); }
      spaces++;
      if (s.d > 4.3 && rnd() < 0.62) {
        const c = car('car_' + lvl + '_' + i, paints[Math.floor(rnd() * paints.length)]);
        const off = (rnd() - 0.5) * 0.12;
        c.position.set(cx + wx * off, 0, cz + wz * off); c.rotation.y = ang + (rnd() < 0.5 ? 0 : PI) + (rnd() - 0.5) * 0.03;
        if (s.w < 2.3) c.scale.set(0.92, 1, 0.92);
        cars.add(c);
      }
    });
    // T3 / T4 footprints above, at street level
    const gh = ext(pk.towers.T3, 2.5, H + 0.3, M.ghost, 'T3_tower_footprint_above_' + lvl, g); gh.userData.noShadow = true;
    const eg = new THREE.LineSegments(new THREE.EdgesGeometry(gh.geometry, 20), new THREE.LineBasicMaterial({ color: 0xd2541f })); eg.name = 'T3_outline'; eg.rotation.x = -PI / 2; eg.position.y = H + 0.3; g.add(eg);
    const g4 = ext(pk.towers.T4, 2.5, H + 0.3, M.ghost4, 'T4_tower_footprint_above_' + lvl, g); g4.userData.noShadow = true;
  }
  const setLevel = (lvl) => { for (const k in levels) levels[k].visible = k === lvl; };
  setLevel('-1');
  const P = (x, y, h = 0) => [px(x), h, pz(y)];
  const cx = pk.t3core.reduce((a, q) => a + q[0], 0) / pk.t3core.length, cy = pk.t3core.reduce((a, q) => a + q[1], 0) / pk.t3core.length;
  const t3center = [px(cx), 0, pz(cy)];
  const counts = Object.fromEntries(Object.entries(pk.levels).map(([k, L]) => [k, { stalls: L.stalls.length, numbered: L.stalls.filter((s) => s.n).length }]));
  const labels = [...pk.towerLabels.map((l) => ({ t: l.t, w: P(l.x, l.y, 0.3) })),
    { t: 'רמפה בין המפלסים', w: P(1131, 1530, 0.3) }, { t: 'רמפה מזרחית', w: P(1986, 1389, 0.3) }];
  return { park, levels, setLevel, P, spaces, counts, t3center, labels };
}
