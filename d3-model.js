// T3-D3 apartment (apt 138, floor 23) + towers T3/T4 massing, traced 1:1 from the sale drawings.
// Plan coordinates are PDF points straight off the drawings (unit sheet 1:50, building sheets 1:100).
export async function build(THREE, unitPt, bldPt, TX = {}) {
  const PI = Math.PI;
  // ---------- seeded random ----------
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // ---------- textures ----------
  function canvasTex(w, h, draw, rx, ry) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
    t.repeat.set(rx, ry); t.anisotropy = 8; return t;
  }
  const mottle = (g, w, h, n, cols, a) => {
    for (let i = 0; i < n; i++) {
      g.fillStyle = cols[i % cols.length]; g.globalAlpha = a * rnd();
      g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 4 + rnd() * w * 0.08, 3 + rnd() * h * 0.05, rnd() * PI, 0, 2 * PI); g.fill();
    }
    g.globalAlpha = 1;
  };
  const veins = (g, w, h, n, col, a, lw) => {
    g.strokeStyle = col;
    for (let i = 0; i < n; i++) {
      g.globalAlpha = a * (0.4 + rnd()); g.lineWidth = lw * (0.4 + rnd());
      g.beginPath(); let x = rnd() * w, y = 0; g.moveTo(x, y);
      while (y < h) { const nx = x + (rnd() - 0.5) * w * 0.25, ny = y + h * (0.08 + rnd() * 0.12); g.quadraticCurveTo(x + (rnd() - 0.5) * w * 0.2, (y + ny) / 2, nx, ny); x = nx; y = ny; }
      g.stroke();
    }
    g.globalAlpha = 1;
  };
  const porcelainTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#e6e1d9'; g.fillRect(0, 0, w, h);
    mottle(g, w, h, 900, ['#d9d2c7', '#f1ede6', '#ddd6cb'], 0.18);
    veins(g, w, h, 5, '#c9c0b3', 0.25, 2.5);
    g.strokeStyle = '#cbc4b8'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3);
  }, 1 / 1.2, 1 / 1.2);
  const bathTex = canvasTex(512, 1024, (g, w, h) => {
    g.fillStyle = '#a49c91'; g.fillRect(0, 0, w, h);
    mottle(g, w, h, 700, ['#958d82', '#b2aa9f', '#9c9489'], 0.22);
    veins(g, w, h, 3, '#bdb5aa', 0.2, 2);
    g.strokeStyle = '#8b8378'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3);
  }, 1 / 0.6, 1 / 1.2);
  const plank = (g, x, y, w, h, base) => {
    g.fillStyle = base; g.fillRect(x, y, w, h);
    for (let i = 0; i < 26; i++) {
      g.strokeStyle = rnd() > 0.5 ? '#7a5634' : '#d8b48a'; g.globalAlpha = 0.05 + rnd() * 0.09; g.lineWidth = 0.6 + rnd() * 1.6;
      const gx = x + rnd() * w; g.beginPath(); g.moveTo(gx, y);
      g.bezierCurveTo(gx + (rnd() - 0.5) * 10, y + h * 0.33, gx + (rnd() - 0.5) * 10, y + h * 0.66, gx + (rnd() - 0.5) * 6, y + h); g.stroke();
    }
    g.globalAlpha = 1;
  };
  const oakFloorTex = canvasTex(512, 1280, (g, w, h) => {
    const cols = ['#bf9a70', '#c8a57b', '#b38e65', '#c39f74', '#b9946a'];
    const pw = w / 4;
    for (let c = 0; c < 4; c++) {
      let y = -rnd() * 600; let k = 0;
      while (y < h) { const len = 600 + rnd() * 400; plank(g, c * pw, y, pw, len, cols[(c + k++) % cols.length]); g.fillStyle = 'rgba(70,48,28,0.55)'; g.fillRect(c * pw, y, pw, 2); y += len; }
      g.fillStyle = 'rgba(70,48,28,0.45)'; g.fillRect(c * pw, 0, 2, h);
    }
  }, 1 / 0.8, 1 / 2.0);
  const oakTex = canvasTex(512, 512, (g, w, h) => { plank(g, 0, 0, w, h, '#c4a077'); plank(g, 0, 0, w, h, 'rgba(0,0,0,0)'); }, 1, 1);
  const marbleTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#f2f0ec'; g.fillRect(0, 0, w, h);
    mottle(g, w, h, 300, ['#e7e3dd', '#faf9f6'], 0.25);
    veins(g, w, h, 7, '#a9a39a', 0.35, 3); veins(g, w, h, 10, '#c9c3ba', 0.3, 1.5);
  }, 1, 1);
  const flutedTex = canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = '#c29d72'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) { const gr = g.createLinearGradient(i * 32, 0, i * 32 + 32, 0); gr.addColorStop(0, '#9c7a54'); gr.addColorStop(0.25, '#c9a57a'); gr.addColorStop(0.7, '#cfac81'); gr.addColorStop(1, '#8f6e4a'); g.fillStyle = gr; g.fillRect(i * 32, 0, 32, h); }
  }, 6, 1);

  // ---------- materials (named — they become usemtl / glTF material names) ----------
  const std = (name, color, roughness, metalness = 0, map = null, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, map, ...extra }); m.name = name; return m;
  };
  const M = {
    plaster: std('plaster_warm_white', 0xf1eee8, 0.92),
    ceiling: std('ceiling_white', 0xf7f5f1, 0.95),
    slab: std('concrete_slab', 0xb7b2a9, 0.9),
    porcelain: std('porcelain_120x120_warm_grey', 0xe4ded5, 0.3, 0, porcelainTex),
    oakFloor: std('oak_parquet_natural', 0xffffff, 0.5, 0, oakFloorTex),
    bathTile: std('porcelain_60x120_greige_stone', 0xffffff, 0.38, 0, bathTex),
    oak: std('oak_veneer', 0xffffff, 0.55, 0, oakTex),
    fluted: std('oak_fluted_panel', 0xffffff, 0.6, 0, flutedTex),
    cabinet: std('kitchen_matte_greige', 0xd3ccc1, 0.62),
    cabinetTall: std('kitchen_matte_taupe', 0x8d8174, 0.58),
    quartz: std('porcelain_slab_calacatta', 0xffffff, 0.16, 0, marbleTex),
    blackMetal: std('matte_black_metal', 0x1d1d1d, 0.42, 0.35),
    blackGlass: std('black_glass', 0x0c0c0d, 0.06, 0.25),
    alu: std('aluminium_anthracite', 0x3a3c3f, 0.42, 0.35),
    glass: std('clear_glazing', 0xd6e6ea, 0.03, 0.1, null, { transparent: true, opacity: 0.16, depthWrite: false }),
    frost: std('frosted_glazing', 0xf2f4f4, 0.4, 0, null, { transparent: true, opacity: 0.78 }),
    bronze: std('bronze_tinted_glass', 0x5b4a3a, 0.05, 0.2, null, { transparent: true, opacity: 0.42, depthWrite: false }),
    mirror: std('mirror', 0xdfe4e6, 0.03, 0.95),
    sofa: std('boucle_sand', 0xcbc1b0, 1),
    chairFab: std('fabric_taupe', 0x9b8c7b, 0.95),
    bed: std('upholstery_greige', 0xb5a998, 0.95),
    linen: std('linen_white', 0xf3f0e9, 0.95),
    clay: std('linen_clay', 0xb4846a, 0.95),
    ceramic: std('ceramic_white', 0xfbfbfa, 0.12),
    travertine: std('travertine', 0xd7c8ae, 0.55),
    rug: std('wool_rug_oat', 0xd8d0c2, 1),
    door: std('door_white_lacquer', 0xefede8, 0.45),
    entry: std('entry_door_anthracite', 0x2e2e2f, 0.5, 0.25),
    steel: std('mamad_blast_steel', 0x8b8e90, 0.45, 0.35),
    led: std('led_3000k', 0xffd4a6, 0.5, 0, null, { emissive: 0xffc68a, emissiveIntensity: 3.2 }),
    screen: std('tv_screen', 0x0a0a0b, 0.12, 0.2),
    planter: std('fibre_cement_planter', 0x7d7972, 0.85),
    foliage: std('foliage_olive', 0x5d7547, 0.8),
    foliageDark: std('foliage_deep', 0x3f5a35, 0.85),
    trunk: std('tree_bark', 0x6d5a45, 0.9),
    appliance: std('appliance_white', 0xeceae6, 0.35),
    outdoor: std('outdoor_fabric_ecru', 0xe2dccf, 0.95),
    teak: std('teak', 0x95694a, 0.6),
    sheer: std('sheer_linen', 0xf6f3ec, 0.95, 0, null, { transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }),
    hvac: std('hvac_slot_black', 0x151515, 0.6),
    // building
    facade: std('facade_render_white', 0xebe7df, 0.85),
    band: std('facade_slab_band', 0xd6d0c4, 0.8),
    fglass: std('facade_glazing', 0x71848f, 0.05, 0.55),
    rglass: std('railing_glass', 0xbcd2d6, 0.05, 0.1, null, { transparent: true, opacity: 0.3, depthWrite: false }),
    roof: std('roof_membrane', 0xc7c3bc, 0.92),
    solar: std('solar_collector', 0x1f2b3b, 0.25, 0.4),
    paving: std('site_paving', 0xd9d4ca, 0.9),
    highlight: std('unit_highlight', 0xe2703a, 0.6, 0, null, { transparent: true, opacity: 0.38, depthWrite: false, depthTest: false, emissive: 0xe2703a, emissiveIntensity: 0.35 }),
  };

  // photo-scanned PBR maps (Poly Haven, CC0) when available
  const rep = (t, r, srgb) => { if (!t) return null; const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(r, r); c.anisotropy = 8; c.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; c.needsUpdate = true; return c; };
  const pbr = (m, set, r, opts = {}) => { if (!set) return; if (set.d) m.map = rep(set.d, r, true); if (set.n) { m.normalMap = rep(set.n, r); m.normalScale = new THREE.Vector2(opts.ns ?? 1, opts.ns ?? 1); } if (set.r) { m.roughnessMap = rep(set.r, r); m.roughness = opts.rough ?? 1; } if (opts.color != null) m.color.set(opts.color); m.needsUpdate = true; };
  pbr(M.oakFloor, TX.floor, 1 / 1.8, { color: 0xf3ece2 });
  pbr(M.oak, TX.oak, 1, { color: 0xf6efe6, rough: 0.9 });
  pbr(M.sofa, TX.boucle, 1 / 0.45, { color: 0xf2ece2, ns: 1.2 });
  pbr(M.bed, TX.linen, 1 / 0.35, { ns: 0.8 }); pbr(M.linen, TX.linen, 1 / 0.35, { ns: 0.6 });
  pbr(M.clay, TX.linen, 1 / 0.35, { ns: 0.8 }); pbr(M.chairFab, TX.linen, 1 / 0.35, { ns: 0.8 });
  pbr(M.plaster, TX.wall, 1 / 1.6, { ns: 0.35, rough: 0.95 }); pbr(M.ceiling, TX.wall, 1 / 1.6, { ns: 0.25, rough: 0.95 });
  { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); g.fillStyle = 'rgb(60,60,60)'; g.fillRect(0, 0, 512, 512); g.strokeStyle = 'rgb(230,230,230)'; g.lineWidth = 4; g.strokeRect(2, 2, 508, 508);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 1.2, 1 / 1.2); M.porcelain.roughnessMap = t; M.porcelain.roughness = 1; }
  M.quartz.roughness = 0.12; M.ceramic.roughness = 0.08;


  // ---------- extra materials (sale spec finishes) ----------
  const tileCanvas = (w, h, base, grout, mot, gw = 3) => canvasTex(w, h, (g, W, H) => {
    g.fillStyle = base; g.fillRect(0, 0, W, H); mottle(g, W, H, 500, mot, 0.12);
    g.strokeStyle = grout; g.lineWidth = gw; g.strokeRect(gw / 2, gw / 2, W - gw, H - gw);
  }, 1, 1);
  const wallTileTex = tileCanvas(512, 1024, '#eeece8', '#d2cec6', ['#e6e3de', '#f6f5f2'], 4);   // 30x60 glazed porcelain, to ceiling
  wallTileTex.repeat.set(1 / 0.3, 1 / 0.6);
  const wcTileTex = tileCanvas(512, 1024, '#e9e4dc', '#cfc7bb', ['#e1dbd1', '#f1ede7'], 4);
  wcTileTex.repeat.set(1 / 0.3, 1 / 0.6);
  const bathFloorTex = tileCanvas(512, 512, '#b9b2a7', '#9e968a', ['#aea79c', '#c6bfb4'], 3);  // 60x60 bath floor
  bathFloorTex.repeat.set(1 / 0.6, 1 / 0.6);
  const balcTex = tileCanvas(512, 512, '#c9c2b6', '#a8a094', ['#bfb8ab', '#d4cdc1'], 3);       // 60x60 anti-slip R11
  balcTex.repeat.set(1 / 0.6, 1 / 0.6);
  const splashTex = tileCanvas(256, 768, '#f4f2ee', '#d6d2ca', ['#ecebe6', '#fbfaf8'], 3);      // 10x30 kitchen splash
  splashTex.repeat.set(1 / 0.1, 1 / 0.3);
  const slatTex = canvasTex(64, 64, (g, W, H) => { g.fillStyle = '#d9dad8'; g.fillRect(0, 0, W, H); g.fillStyle = '#9fa2a2'; g.fillRect(0, H - 6, W, 6); g.fillStyle = '#eef0ee'; g.fillRect(0, 4, W, 6); }, 1, 1 / 0.055);
  Object.assign(M, {
    wallTile: std('wall_tile_30x60_white_gloss', 0xffffff, 0.22, 0, wallTileTex),
    wcTile: std('wall_tile_30x60_ivory', 0xffffff, 0.25, 0, wcTileTex),
    bathFloor: std('floor_tile_60x60_wet_R10', 0xffffff, 0.5, 0, bathFloorTex),
    balcFloor: std('floor_tile_60x60_balcony_R11', 0xffffff, 0.7, 0, balcTex),
    splash: std('kitchen_splash_tile_10x30', 0xffffff, 0.2, 0, splashTex),
    chrome: std('chrome_nickel', 0xd8dadc, 0.12, 0.9),
    steelSS: std('stainless_steel', 0xb9bcbe, 0.3, 0.8),
    caesar: std('quartz_caesarstone_20mm', 0xe9e6e0, 0.18, 0, marbleTex),
    formica: std('kitchen_formica_greige', 0xcfc8bd, 0.55),
    formicaTall: std('kitchen_formica_taupe', 0x9c8f80, 0.55),
    doorLam: std('door_formica_white_smooth', 0xf2f0eb, 0.5),
    wpc: std('door_frame_wpc_white', 0xe9e7e2, 0.55),
    concrete: std('concrete_raw', 0xa9a49b, 0.95),
    shutter: std('aluminium_roller_shutter', 0xffffff, 0.5, 0.3, slatTex),
    gasValve: std('gas_valve_yellow', 0xe8b923, 0.4, 0.2),
    plate: std('socket_plate_white', 0xf6f6f4, 0.35),
    plateHi: std('socket_plate_highlight', 0xe2703a, 0.5, 0, null, { emissive: 0xe2703a, emissiveIntensity: 0.9 }),
    fridge: std('fridge_stainless', 0xc4c7c9, 0.32, 0.65),
    grille: std('ac_linear_grille_white', 0xf3f3f1, 0.5, 0.1),
    louvre: std('aluminium_louvre_white', 0xe7e7e4, 0.45, 0.3),
  });
  const parquetMat = M.oakFloor;

  // ---------- helpers (unit sheet 1:50, scale bar 56.69 pt = 1 m) ----------
  const K = 0.01764, UCX = 670.76, UCY = 530.72;
  const ux = (x) => (x - UCX) * K, uz = (y) => (y - UCY) * K;
  const shape = (pts, fx, fz) => {
    const s = new THREE.Shape();
    pts.forEach((p, i) => (i ? s.lineTo(fx(p[0]), -fz(p[1])) : s.moveTo(fx(p[0]), -fz(p[1]))));
    s.closePath(); return s;
  };
  const extrudeGeo = (shapes, h) => new THREE.ExtrudeGeometry(shapes, { depth: h, bevelEnabled: false, curveSegments: 24 });
  const placeExtrude = (geo, mat, name, y0, parent) => {
    const m = new THREE.Mesh(geo, mat); m.rotation.x = -PI / 2; m.position.y = y0; m.name = name; parent && parent.add(m); return m;
  };
  const uExtrude = (polys, h, y0, mat, name, parent) => placeExtrude(extrudeGeo(polys.map((p) => shape(p, ux, uz)), h), mat, name, y0, parent);
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const pbox = (name, mat, x0, y0, x1, y1, h0, h1, parent) => {
    const g = new THREE.BoxGeometry(Math.max(Math.abs(x1 - x0) * K, 0.001), Math.max(h1 - h0, 0.001), Math.max(Math.abs(y1 - y0) * K, 0.001));
    const m = new THREE.Mesh(g, mat); m.name = name;
    m.position.set(ux((x0 + x1) / 2), (h0 + h1) / 2, uz((y0 + y1) / 2)); parent.add(m); return m;
  };
  const rbox = (name, mat, x0, y0, x1, y1, h0, h1, r, parent) => {
    const w = (x1 - x0) * K, d = (y1 - y0) * K, h = h1 - h0;
    const b = Math.min(r * 0.6, h / 2 - 0.002, w / 2 - 0.002, d / 2 - 0.002);
    const iw = w / 2 - b, id = d / 2 - b, rr = Math.max(Math.min(r - b, iw - 0.001, id - 0.001), 0.002);
    const s = new THREE.Shape();
    s.moveTo(-iw + rr, -id); s.lineTo(iw - rr, -id); s.quadraticCurveTo(iw, -id, iw, -id + rr);
    s.lineTo(iw, id - rr); s.quadraticCurveTo(iw, id, iw - rr, id); s.lineTo(-iw + rr, id);
    s.quadraticCurveTo(-iw, id, -iw, id - rr); s.lineTo(-iw, -id + rr); s.quadraticCurveTo(-iw, -id, -iw + rr, -id);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(h - 2 * b, 0.001), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 6 });
    const m = new THREE.Mesh(g, mat); m.name = name; m.rotation.x = -PI / 2;
    m.position.set(ux((x0 + x1) / 2), h0 + b, uz((y0 + y1) / 2)); parent.add(m); return m;
  };
  const pcyl = (name, mat, x, y, r, h0, h1, parent, seg = 40, r2) => {
    const g = new THREE.CylinderGeometry(r, r2 ?? r, h1 - h0, seg);
    const m = new THREE.Mesh(g, mat); m.name = name; m.position.set(ux(x), (h0 + h1) / 2, uz(y)); parent.add(m); return m;
  };
  const grp = (name, parent) => { const g = new THREE.Group(); g.name = name; parent.add(g); return g; };

  // =====================================================================
  // MODEL 1 — APARTMENT T3-D3 (4 rooms, 108.0 m² + covered sun balcony 9.7 m²)
  // =====================================================================
  const unit = new THREE.Group(); unit.name = 'T3-D3_apartment_138';
  const CEIL = 2.60, DROP = 2.40;          // spec 3.1: living rooms ≥ 2.50, corridors/service ≥ 2.05
  const shell = grp('shell', unit), floors = grp('floor_finishes', unit), ceil = grp('ceilings', unit);
  const joinery = grp('joinery_and_furniture', unit), wet = grp('sanitary', unit), open = grp('doors_windows', unit);
  const elec = grp('electrical_points', unit);

  const footprint = [[545.75, 239.35], [1070.71, 239.35], [1070.71, 738.24], [957.33, 738.24], [957.33, 822.09], [724.9, 822.09], [724.9, 738.81], [270.8, 738.81], [270.8, 505.81], [449.94, 505.81], [449.94, 332.33], [545.75, 332.33]];
  const balcony = rect(270.8, 332.33, 449.94, 505.81);
  uExtrude([footprint, balcony], 0.25, -0.26, M.slab, 'structural_slab', shell);
  uExtrude(unitPt.walls, CEIL + 0.01, -0.01, M.plaster, 'walls_block_concrete_plaster', shell);

  // ---- rooms (interior polygons, pt) ----
  const R = {
    ldk: [[469.79, 352.17], [764.58, 352.17], [764.58, 256.36], [1053.71, 256.36], [1053.71, 548.32], [469.79, 548.32]],
    corridor: rect(512.3, 548.32, 569.0, 610.68),
    hall: [[832.61, 559.66], [889.3, 559.66], [889.3, 548.32], [954.5, 548.32], [954.5, 624.86], [832.61, 624.86]],
    master: [[285.54, 525.65], [464.12, 525.65], [464.12, 553.99], [506.63, 553.99], [506.63, 610.68], [458.45, 610.68], [458.45, 724.07], [285.54, 724.07]],
    masterBath: rect(464.12, 616.35, 569.0, 724.07),
    bed3: rect(574.66, 553.99, 733.4, 724.07),
    mamad: rect(756.08, 636.2, 937.49, 811.94),
    bath: rect(960.17, 553.99, 1050.87, 718.4),
    wc: rect(739.07, 553.99, 826.94, 622.02),
    service: rect(659.7, 253.53, 758.91, 346.5),
    mistor: rect(557.09, 253.53, 644.96, 332.33),
    balcony,
  };
  // floor finishes (top at 0.000; mamad +1.5 cm per HFC)
  const porcelainFloor = uExtrude([R.ldk, R.corridor, R.hall, R.bed3, rect(458.45, 553.99, 512.3, 610.68)], 0.01, -0.01, M.porcelain, 'floor_porcelain_living_kitchen_dining_corridors_bedroom3', floors);
  const masterFloor = uExtrude([R.master], 0.01, -0.01, M.porcelain, 'floor_master_bedroom', floors);
  uExtrude([R.mamad], 0.025, -0.01, M.porcelain, 'floor_porcelain_mamad_+15mm', floors);
  uExtrude([R.masterBath, R.bath, R.wc, R.service], 0.01, -0.01, M.bathFloor, 'floor_porcelain_wet_rooms_60x60', floors);
  uExtrude([R.balcony], 0.01, -0.02, M.balcFloor, 'floor_porcelain_sun_balcony_R11', floors);
  uExtrude([R.mistor], 0.01, -0.03, M.concrete, 'floor_mistor_concrete', floors);
  // thresholds in door openings
  [[512.3, 548.32, 569, 553.99], [506.63, 559.66, 512.3, 605.01], [569, 559.66, 574.66, 605.01], [826.94, 562.5, 832.61, 607.85], [954.5, 562.5, 960.17, 607.85], [886.35, 624.86, 931.93, 636.2], [458.45, 673.04, 464.12, 718.4], [758.91, 295.48, 764.58, 340.83], [449.94, 360.68, 469.79, 496.73], [1053.71, 480.29, 1070.71, 536.99]]
    .forEach((r, i) => pbox('threshold_' + i, M.porcelain, r[0], r[1], r[2], r[3], -0.01, i === 5 ? 0.015 : 0, floors));

  // ---- ceilings (hidden in cutaway) ----
  uExtrude([footprint], 0.25, CEIL, M.ceiling, 'ceiling_slab', ceil);
  uExtrude([balcony], 0.25, CEIL, M.ceiling, 'sun_balcony_soffit_(balcony_above)', ceil);
  const dropRooms = [R.corridor, R.hall, R.masterBath, R.bath, R.wc, R.service];
  uExtrude(dropRooms, CEIL - DROP, DROP, M.ceiling, 'gypsum_drop_ceiling_VRF_ducts', ceil);
  // VRF ducted mini-central: linear supply grilles + return grille (spec 4.1)
  pbox('ac_return_grille_hall', M.grille, 900, 575, 940, 600, DROP - 0.006, DROP - 0.001, ceil);
  pbox('ac_supply_slot_living', M.hvac, 892, 548.8, 952, 549.6, 2.47, 2.53, ceil);
  pbox('ac_supply_slot_dining_kitchen', M.hvac, 515, 548.8, 566, 549.6, 2.47, 2.53, ceil);
  pbox('ac_supply_grille_master', M.grille, 459.5, 556, 460.4, 600, 2.32, 2.48, ceil);
  pbox('ac_supply_grille_bedroom3', M.grille, 575, 562, 575.9, 603, 2.32, 2.48, ceil);
  pbox('ac_supply_grille_mamad', M.grille, 790, 636.4, 860, 637.3, 2.32, 2.46, ceil);
  // light points per spec table 5 (fittings illustrative)
  const LP = [
    ['entrance', 1022, 508, CEIL], ['living_1', 560, 450, CEIL], ['living_2', 665, 450, CEIL], ['kitchen', 880, 335, CEIL], ['dining_pendant', 845, 435, 1.62],
    ['corridor', 540, 580, DROP], ['hall', 920, 600, DROP], ['master', 372, 645, CEIL], ['bedroom3', 654, 640, CEIL], ['mamad', 847, 724, CEIL],
    ['master_bath', 500, 690, DROP], ['general_bath', 1000, 640, DROP], ['guest_wc', 790, 585, DROP], ['service_balcony', 710, 320, DROP], ['sun_balcony_wall', 300, 505, 2.2],
  ];
  LP.forEach(([n, x, y, h]) => {
    if (n === 'dining_pendant') return;
    if (n === 'sun_balcony_wall') { pbox('light_point_' + n, M.led, x, y - 2.5, x + 9, y, 2.15, 2.22, ceil); return; }
    pcyl('light_point_' + n + '_trim', M.ceramic, x, y, 0.06, h - 0.012, h - 0.001, ceil, 32);
    pcyl('light_point_' + n, M.led, x, y, 0.045, h - 0.014, h - 0.011, ceil, 24);
  });

  // =====================================================================
  // OPENINGS — table 3 of the sale spec (doors, windows, shutters)
  // =====================================================================
  const F = 2.9; // 5 cm frame, in pt
  const gb = (o, name, mat, A0, A1, T0, T1, h0, h1, p) =>
    o.axis === 'x' ? pbox(name, mat, A0, T0, A1, T1, h0, h1, p) : pbox(name, mat, T0, A0, T1, A1, h0, h1, p);
  const panel = (o, name, A0, A1, T0, T1, h0, h1, p, glass = M.glass, frame = M.alu) => {
    const st = 2.6;
    gb(o, name + '_stile_a', frame, A0, A0 + st, T0, T1, h0, h1, p); gb(o, name + '_stile_b', frame, A1 - st, A1, T0, T1, h0, h1, p);
    gb(o, name + '_rail_bottom', frame, A0, A1, T0, T1, h0, h0 + 0.06, p); gb(o, name + '_rail_top', frame, A0, A1, T0, T1, h1 - 0.05, h1, p);
    gb(o, name + '_glass', glass, A0 + st, A1 - st, (T0 + T1) / 2 - 0.25, (T0 + T1) / 2 + 0.25, h0 + 0.06, h1 - 0.05, p);
  };
  const X = (a0, a1, c0, c1) => ({ axis: 'x', a0, a1, c0, c1 }), Y = (a0, a1, c0, c1) => ({ axis: 'y', a0, a1, c0, c1 });
  // window: optional fixed lower light (spec: "חלק קבוע תחתון"), then sashes; ext = side of the facade (c0|c1) for the roller shutter
  const shutters = [];
  function windowAt(o, sill, head, name, { frost = false, fixedLow = 0, sashes = 1, slide = false, shutter = null } = {}) {
    const g = grp(name, open); const tm = (o.c0 + o.c1) / 2; const gl = frost ? M.frost : M.glass;
    if (sill > 0) gb(o, name + '_upstand', M.plaster, o.a0, o.a1, o.c0, o.c1, -0.01, sill, g);
    gb(o, name + '_lintel', M.plaster, o.a0, o.a1, o.c0, o.c1, head, CEIL, g);
    if (sill > 0) gb(o, name + '_sill_stone', M.caesar, o.a0, o.a1, o.c0 - 0.6, o.c1 + 0.6, sill - 0.02, sill, g);
    gb(o, name + '_frame_head', M.alu, o.a0, o.a1, tm - 3, tm + 3, head - 0.05, head, g);
    gb(o, name + '_frame_jamb_a', M.alu, o.a0, o.a0 + F, tm - 3, tm + 3, sill, head, g);
    gb(o, name + '_frame_jamb_b', M.alu, o.a1 - F, o.a1, tm - 3, tm + 3, sill, head, g);
    let h0 = sill;
    if (fixedLow) { panel(o, name + '_fixed_lower', o.a0 + F, o.a1 - F, tm - 2, tm + 2, sill, fixedLow, g, gl); gb(o, name + '_transom', M.alu, o.a0, o.a1, tm - 3, tm + 3, fixedLow, fixedLow + 0.04, g); h0 = fixedLow + 0.04; }
    const L = (o.a1 - o.a0 - 2 * F) / sashes;
    for (let i = 0; i < sashes; i++) {
      const off = slide ? (i % 2 ? 1.6 : -1.6) : 0;
      panel(o, name + '_sash' + i, o.a0 + F + i * L - (slide && i ? 2 : 0), o.a0 + F + (i + 1) * L + (slide && !i ? 2 : 0), tm + off - 1.4, tm + off + 1.4, h0, head - 0.05, g, gl);
    }
    if (!slide) gb(o, name + '_handle', M.chrome, o.a0 + F + 2, o.a0 + F + 3.2, tm - 2.8, tm - 1.6, h0 + (head - h0) * 0.5 - 0.06, h0 + (head - h0) * 0.5 + 0.06, g);
    if (shutter) addShutter(o, head, name, shutter);
    return g;
  }
  // electric aluminium roller shutter (rolls into a concealed box in the lintel)
  function addShutter(o, head, name, ext) {
    const c = ext === 'c0' ? o.c0 + 1.2 : o.c1 - 1.2;
    const w = (o.a1 - o.a0) * K, gH = new THREE.BoxGeometry(o.axis === 'x' ? w : 0.012, 1, o.axis === 'x' ? 0.012 : w);
    gH.translate(0, -0.5, 0);
    const m = new THREE.Mesh(gH, M.shutter.clone()); m.name = name + '_roller_shutter_electric';
    m.material.map = slatTex.clone(); m.material.map.needsUpdate = true;
    const mid = (o.a0 + o.a1) / 2;
    m.position.set(o.axis === 'x' ? ux(mid) : ux(c), head, o.axis === 'x' ? uz(c) : uz(mid));
    m.userData.noShadow = true; m.userData.full = head;
    open.add(m); shutters.push(m);
  }
  function sliding(o, head, name, shutter) {
    const g = grp(name, open); const tm = (o.c0 + o.c1) / 2, mid = (o.a0 + o.a1) / 2;
    gb(o, name + '_lintel', M.plaster, o.a0, o.a1, o.c0, o.c1, head, CEIL, g);
    gb(o, name + '_frame_head', M.alu, o.a0, o.a1, tm - 4, tm + 4, head - 0.06, head, g);
    gb(o, name + '_frame_track', M.alu, o.a0, o.a1, tm - 4, tm + 4, 0, 0.02, g);
    gb(o, name + '_frame_jamb_a', M.alu, o.a0, o.a0 + F, tm - 4, tm + 4, 0, head, g);
    gb(o, name + '_frame_jamb_b', M.alu, o.a1 - F, o.a1, tm - 4, tm + 4, 0, head, g);
    panel(o, name + '_panel_fixed', mid - 1.5, o.a1 - F, tm + 0.4, tm + 3.4, 0.02, head - 0.06, g);
    panel(o, name + '_panel_sliding', o.a0 + F + (mid - o.a0) * 0.55, mid + 1.5 + (mid - o.a0) * 0.55, tm - 3.4, tm - 0.4, 0.02, head - 0.06, g);
    gb(o, name + '_handle', M.chrome, mid + (mid - o.a0) * 0.55 - 1, mid + (mid - o.a0) * 0.55, tm - 4.6, tm - 3.4, 0.95, 1.25, g);
    if (shutter) addShutter(o, head, name, shutter);
  }
  // hinged door with a real swing angle (0 = closed, 90 = fully open)
  function door(o, head, name, { hinge = 'a0', side = 1, ang = 90, mat = M.doorLam, frame = M.wpc, leafT = 0.04, vision = false, handle = M.chrome } = {}) {
    const g = grp(name, open); const J = 1.2;
    gb(o, name + '_lintel', M.plaster, o.a0, o.a1, o.c0, o.c1, head, CEIL, g);
    gb(o, name + '_frame_jamb_a', frame, o.a0, o.a0 + J, o.c0 - 0.5, o.c1 + 0.5, 0, head, g);
    gb(o, name + '_frame_jamb_b', frame, o.a1 - J, o.a1, o.c0 - 0.5, o.c1 + 0.5, 0, head, g);
    gb(o, name + '_frame_head', frame, o.a0, o.a1, o.c0 - 0.5, o.c1 + 0.5, head - 0.04, head, g);
    const A = hinge === 'a0' ? o.a0 + J : o.a1 - J, sA = hinge === 'a0' ? 1 : -1;
    const C = side > 0 ? o.c1 : o.c0;
    const LK = (o.a1 - o.a0 - 2 * J) * K, th = ang * PI / 180;
    const ca = Math.cos(th) * sA, cc = Math.sin(th) * side;
    const dir = o.axis === 'x' ? [ca, cc] : [cc, ca];
    const H = o.axis === 'x' ? [ux(A), uz(C)] : [ux(C), uz(A)];
    const leafG = new THREE.Group(); leafG.name = name + '_leaf'; g.add(leafG);
    leafG.position.set(H[0], 0, H[1]); leafG.rotation.y = Math.atan2(-dir[1], dir[0]);
    const add = (n, w, h, t, x, y, z, m2) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), m2); m.name = name + '_' + n; m.position.set(x, y, z); leafG.add(m); return m; };
    const lh = head - 0.045;
    add('leaf', LK, lh - 0.008, leafT, LK / 2, 0.008 + (lh - 0.008) / 2, side * leafT / 2 * (o.axis === 'x' ? 1 : -1) * 0, mat);
    if (vision) add('vision_louvre', LK * 0.55, 0.14, leafT + 0.004, LK / 2, 0.32, 0, M.alu);
    add('handle_a', 0.13, 0.02, 0.02, LK - 0.11, 1.02, leafT / 2 + 0.03, handle); add('handle_b', 0.13, 0.02, 0.02, LK - 0.11, 1.02, -leafT / 2 - 0.03, handle);
    add('rose', 0.05, 0.05, leafT + 0.012, LK - 0.06, 1.02, 0, handle);
    return g;
  }

  // --- glazing & doors, table 3 ---
  sliding(Y(360.68, 496.73, 449.94, 469.79), 2.40, 'living_sliding_door_240x240_alu_wing_on_wing', 'c0');
  windowAt(Y(579.22, 669.93, 270.8, 285.54), 0, 2.20, 'master_window_160x220_sliding_fixed_lower', { fixedLow: 0.9, sashes: 2, slide: true, shutter: 'c0' });
  windowAt(X(625.69, 682.38, 724.07, 738.81), 0, 2.20, 'bedroom3_window_100x220_tilt_turn_fixed_lower', { fixedLow: 0.9, sashes: 1, shutter: 'c1' });
  windowAt(X(506.63, 546.32, 724.07, 738.81), 0, 2.20, 'master_bath_window_70x220_tilt_fixed_lower_frosted', { fixedLow: 0.9, sashes: 1, frost: true });
  windowAt(Y(256.36, 330.06, 644.96, 659.7), 1.00, 2.15, 'service_balcony_window_130x115_sliding', { sashes: 2, slide: true });
  // MAMAD: aluminium window 100x100 + HFC steel blast window sliding into a pocket
  windowAt(Y(746.74, 803.43, 724.9, 756.08), 1.10, 2.10, 'mamad_window_100x100_alu_plus_steel', { sashes: 1 });
  const mamadSteel = pbox('mamad_steel_blast_window_sliding_to_pocket', M.steel, 736.4, 746.74, 741.7, 803.43, 1.10, 2.10, open);
  mamadSteel.userData.y0 = mamadSteel.position.z;
  [[0.33], [0.66]].forEach(([f], i) => pcyl('mamad_ventilation_flange_' + i, M.steel, 755.6, 760 + 30 * f, 0.1, 2.28, 2.3, open, 32).rotation.z = PI / 2);
  // doors
  door(Y(480.29, 536.99, 1053.71, 1070.71), 2.20, 'entrance_security_door_100x220_steel', { mat: M.entry, frame: M.entry, ang: 0, leafT: 0.07, hinge: 'a1', side: -1, handle: M.chrome });
  pcyl('entrance_door_peephole', M.chrome, 1053.4, 509, 0.008, 1.5, 1.52, open, 16).rotation.z = PI / 2;
  pbox('intercom_screen_entrance', M.blackGlass, 1052.9, 548, 1053.71, 557, 1.4, 1.58, open);
  door(Y(295.48, 340.83, 758.91, 764.58), 2.10, 'service_balcony_door_80x210', { hinge: 'a0', side: -1, ang: 88 });
  door(Y(562.5, 607.85, 826.94, 832.61), 2.10, 'guest_wc_door_80x210', { hinge: 'a0', side: -1, ang: 70, vision: true });
  door(Y(562.5, 607.85, 954.5, 960.17), 2.10, 'general_bath_door_80x210', { hinge: 'a0', side: 1, ang: 85, vision: true });
  door(Y(559.66, 605.01, 506.63, 512.3), 2.10, 'master_bedroom_door_80x210', { hinge: 'a1', side: -1, ang: 90 });
  door(Y(559.66, 605.01, 569.0, 574.66), 2.10, 'bedroom3_door_80x210', { hinge: 'a1', side: 1, ang: 90 });
  door(Y(673.04, 718.4, 458.45, 464.12), 2.10, 'master_bath_door_80x210', { hinge: 'a0', side: 1, ang: 85, vision: true });
  door(X(886.35, 931.93, 624.86, 636.2), 2.00, 'mamad_steel_blast_door_80x200_opens_out', { hinge: 'a0', side: -1, ang: 80, mat: M.steel, frame: M.steel, leafT: 0.06 });
  door(X(887.6, 930.7, 636.2, 637.4), 2.00, 'mamad_inner_wood_door_80x200_opens_in', { hinge: 'a1', side: 1, ang: 95, frame: M.wpc });
  // mistor façade: aluminium louvre screen
  { const g = grp('mistor_louvre_screen', open); for (let h = 0.08; h < CEIL - 0.05; h += 0.1) pbox('louvre_blade', M.louvre, 547, 253.53, 555.5, 332.9, h, h + 0.016, g);
    pbox('louvre_frame_a', M.louvre, 546, 253.53, 556.5, 256, 0, CEIL, g); pbox('louvre_frame_b', M.louvre, 546, 330.4, 556.5, 332.9, 0, CEIL, g); }
  // sun balcony glass balustrade (west + north edges)
  { const g = grp('sun_balcony_balustrade', open);
    pbox('balustrade_west_shoe', M.alu, 270.8, 332.33, 274.2, 505.81, -0.02, 0.06, g); pbox('balustrade_west_glass', M.glass, 271.9, 332.33, 273.1, 505.81, 0.06, 1.1, g); pbox('balustrade_west_rail', M.alu, 270.8, 332.33, 274.2, 505.81, 1.1, 1.14, g);
    pbox('balustrade_north_shoe', M.alu, 270.8, 332.33, 449.94, 335.7, -0.02, 0.06, g); pbox('balustrade_north_glass', M.glass, 270.8, 333.4, 449.94, 334.6, 0.06, 1.1, g); pbox('balustrade_north_rail', M.alu, 270.8, 332.33, 449.94, 335.7, 1.1, 1.14, g); }

  // =====================================================================
  // KITCHEN — spec 3.3.1: lower + upper + tall units ≈ 6.5 m run, formica fronts, "Grass" hardware,
  // Caesarstone-type quartz 20 mm worktop, single-bowl under-mount sink, pull-out mixer, gas hob point.
  // =====================================================================
  const kit = grp('kitchen', joinery);
  const KY0 = 256.36, KY1 = 290.4, KX0 = 764.58, KX1 = 964.6;
  pbox('kitchen_plinth_pvc', M.blackMetal, KX0, KY0, KX1, KY1 - 3, 0, 0.1, kit);
  pbox('kitchen_lower_cabinets_formica', M.formica, KX0, KY0, KX1, KY1 - 0.4, 0.1, 0.88, kit);
  for (let x = KX0 + 34; x < KX1 - 5; x += 34) pbox('kitchen_lower_door_gap', M.blackMetal, x - 0.2, KY1 - 0.5, x + 0.2, KY1 - 0.3, 0.12, 0.86, kit);
  pbox('kitchen_handle_rail', M.steelSS, KX0 + 2, KY1 - 0.3, KX1 - 2, KY1 + 0.6, 0.8, 0.815, kit);
  pbox('kitchen_worktop_quartz_20mm', M.caesar, KX0, KY0, KX1, KY1 + 1.2, 0.88, 0.90, kit);
  pbox('kitchen_splash_tiles_60cm', M.splash, KX0, KY0, KX1, KY0 + 0.5, 0.90, 1.50, kit);
  pbox('kitchen_sink_undermount_single_bowl', M.steelSS, 812, 262, 846, 284, 0.899, 0.902, kit);
  pbox('kitchen_sink_bowl_shadow', M.blackGlass, 814, 264, 844, 282, 0.8995, 0.9015, kit);
  pcyl('kitchen_mixer_pullout_chrome', M.chrome, 829, 260, 0.022, 0.9, 1.22, kit, 24);
  pbox('kitchen_mixer_spout', M.chrome, 828.2, 260, 829.8, 271, 1.19, 1.23, kit);
  pbox('dishwasher_integrated_panel_reveal', M.blackMetal, 848, KY1 - 0.5, 848.4, KY1, 0.1, 0.88, kit);
  // gas hob (4 burners) over a built-in oven niche
  pbox('gas_hob_4_burner_glass', M.blackGlass, 891, 260, 922, 286, 0.9, 0.906, kit);
  [[898, 266], [915, 266], [898, 280], [915, 280]].forEach(([x, y], i) => { pcyl('gas_burner_' + i, M.blackMetal, x, y, 0.045, 0.906, 0.93, kit, 20); });
  pbox('cooker_hood_slim', M.steelSS, 889, KY0, 924, 285, 1.55, 1.62, kit);
  pbox('cooker_hood_chimney', M.steelSS, 900, KY0, 913, 268, 1.62, CEIL, kit);
  // upper cabinets (≈2.4 m) either side of the hood
  pbox('kitchen_upper_cabinets_left', M.formica, KX0, KY0, 886, 276, 1.5, 2.3, kit);
  pbox('kitchen_upper_cabinets_right', M.formica, 927, KY0, KX1, 276, 1.5, 2.3, kit);
  pbox('led_under_upper_left', M.led, KX0 + 1, KY0 + 1, 885, 275, 1.494, 1.5, kit);
  // tall unit: oven + microwave (spec "יחידת תנור ומיקרו גבוהה") and storage over the fridge
  pbox('kitchen_tall_oven_microwave_unit', M.formicaTall, KX1, KY0, 998.6, KY1, 0, 2.3, kit);
  pbox('built_in_oven', M.blackGlass, KX1 + 1.5, KY1, 997, KY1 + 0.4, 0.75, 1.35, kit);
  pbox('built_in_microwave', M.blackGlass, KX1 + 1.5, KY1, 997, KY1 + 0.4, 1.45, 1.8, kit);
  pbox('fridge_free_standing_stainless', M.fridge, 1001, KY0 + 1, 1050.5, 293, 0, 1.85, kit);
  pbox('fridge_door_split', M.blackMetal, 1025.5, 292.9, 1026, 293.4, 0.05, 1.83, kit);
  pbox('kitchen_storage_over_fridge', M.formicaTall, 998.6, KY0, 1053.71, KY1, 1.95, 2.3, kit);
  pbox('kitchen_bulkhead', M.plaster, KX0, KY0, 1053.71, 276, 2.3, CEIL, kit);
  pbox('kitchen_fridge_side_panel', M.formicaTall, 998.6, KY0, 1001, KY1, 0, 1.95, kit);
  { const g = grp('fruit_bowl', kit); pcyl('fruit_bowl_dish', M.travertine, 790, 275, 0.14, 0.9, 0.96, g, 40, 0.09); }

  // DINING — 6 seats, clear of the kitchen aisle and the entrance swing
  const din = grp('dining', joinery);
  rbox('dining_table_top_oak', M.oak, 795, 405, 895, 465, 0.715, 0.75, 0.03, din);
  pbox('dining_table_leg_a', M.blackMetal, 808, 415, 811, 455, 0, 0.715, din);
  pbox('dining_table_leg_b', M.blackMetal, 879, 415, 882, 455, 0, 0.715, din);
  pbox('dining_table_stretcher', M.blackMetal, 811, 434, 879, 436, 0.62, 0.66, din);
  const chair = (name, x, y, face, parent) => {
    const g = new THREE.Group(); g.name = name; parent.add(g);
    const add = (n, geo, mat, px, py, pz) => { const m = new THREE.Mesh(geo, mat); m.name = name + '_' + n; m.position.set(px, py, pz); g.add(m); return m; };
    [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.17], [0.19, 0.17]].forEach(([a, b], i) => add('leg' + i, new THREE.CylinderGeometry(0.016, 0.012, 0.45, 12), M.oak, a, 0.225, b));
    add('seat', new THREE.BoxGeometry(0.46, 0.07, 0.45), M.chairFab, 0, 0.485, 0);
    add('back', new THREE.BoxGeometry(0.46, 0.34, 0.05), M.chairFab, 0, 0.7, -0.21).rotation.x = -0.08;
    g.position.set(ux(x), 0, uz(y)); g.rotation.y = Math.atan2(face[0], face[1]);
  };
  [813, 845, 877].forEach((x, i) => { chair('dining_chair_n' + i, x, 397, [0, 1], din); chair('dining_chair_s' + i, x, 473, [0, -1], din); });
  pcyl('dining_pendant_shade', M.blackMetal, 845, 435, 0.2, 1.62, 1.78, din, 40, 0.06);
  pcyl('dining_pendant_led', M.led, 845, 435, 0.19, 1.615, 1.622, din, 40);
  pcyl('dining_pendant_cable', M.blackMetal, 845, 435, 0.003, 1.78, CEIL, din, 6);
  pcyl('dining_vase', M.ceramic, 860, 435, 0.06, 0.75, 0.95, din, 32, 0.045);

  // LIVING — TV on the north wall, sofa facing it, slider to the sun balcony kept clear
  const liv = grp('living', joinery);
  rbox('rug_living', M.rug, 525, 385, 705, 500, 0, 0.012, 0.01, liv);
  pbox('media_console_floating_oak', M.oak, 560, 352.17, 665, 374, 0.22, 0.52, liv);
  pbox('media_console_led', M.led, 561, 353, 664, 373, 0.214, 0.22, liv);
  pbox('tv_panel_65in', M.screen, 572, 352.2, 653, 354, 1.0, 1.82, liv);
  pbox('media_wall_fluted_oak', M.fluted, 548, 352.17, 677, 353.2, 0, CEIL, liv).position.z += 0.0;
  // sofa (back to the south), 3 seats
  const SY0 = 440, SY1 = 490;
  pbox('sofa_plinth', M.blackMetal, 541, SY0 + 5, 684, SY1 - 4, 0, 0.06, liv);
  rbox('sofa_base', M.sofa, 535, SY0, 690, SY1, 0.06, 0.4, 0.05, liv);
  rbox('sofa_back', M.sofa, 535, SY1 - 15, 690, SY1, 0.4, 0.8, 0.06, liv);
  rbox('sofa_arm_w', M.sofa, 535, SY0, 543, SY1, 0.4, 0.62, 0.04, liv); rbox('sofa_arm_e', M.sofa, 682, SY0, 690, SY1, 0.4, 0.62, 0.04, liv);
  [[543, 589], [589.5, 635.5], [636, 682]].forEach(([a, b], i) => {
    rbox('sofa_seat_cushion_' + i, M.sofa, a, SY0 + 1, b, SY1 - 15, 0.4, 0.5, 0.06, liv);
    rbox('sofa_back_cushion_' + i, M.sofa, a + 1, SY1 - 27, b - 1, SY1 - 15, 0.42, 0.78, 0.07, liv);
  });
  rbox('cushion_clay', M.clay, 548, SY1 - 32, 570, SY1 - 25, 0.5, 0.82, 0.05, liv);
  rbox('cushion_linen', M.linen, 656, SY1 - 32, 678, SY1 - 25, 0.5, 0.8, 0.05, liv);
  pcyl('coffee_table_travertine', M.travertine, 612, 405, 0.42, 0.3, 0.37, liv, 64);
  pcyl('coffee_table_pedestal', M.travertine, 612, 405, 0.24, 0, 0.3, liv, 48);
  pcyl('side_table', M.blackMetal, 703, 468, 0.17, 0, 0.52, liv, 40, 0.15);
  pbox('sheer_curtain_living_a', M.sheer, 472, 362, 474, 380, 0.02, 2.55, liv); pbox('sheer_curtain_living_b', M.sheer, 472, 478, 474, 496, 0.02, 2.55, liv);
  pbox('curtain_track_living', M.blackMetal, 471.5, 358, 474.5, 499, 2.55, 2.58, liv);
  const plant = (name, x, y, potR, potH, h, parent) => {
    const g = grp(name, parent); pcyl(name + '_pot', M.planter, x, y, potR, 0, potH, g, 40, potR * 0.82);
    for (let i = 0; i < 7; i++) {
      const s = new THREE.Mesh(new THREE.IcosahedronGeometry(potR * (0.9 + rnd() * 0.7), 1), i % 2 ? M.foliage : M.foliageDark);
      s.name = name + '_foliage_' + i; const a = (i / 7) * 2 * PI;
      s.position.set(ux(x) + Math.cos(a) * potR * 0.7 * rnd(), potH + h * (0.35 + 0.6 * rnd()), uz(y) + Math.sin(a) * potR * 0.7 * rnd()); g.add(s);
    }
    pcyl(name + '_stem', M.trunk, x, y, 0.02, potH, potH + h * 0.6, g, 8);
  };
  plant('plant_living_ficus', 486, 530, 0.2, 0.5, 1.2, liv);
  plant('plant_entry_corner', 1037, 456, 0.18, 0.45, 1.0, liv);

  // MASTER SUITE — bed head on the solid north wall, wardrobe on the south wall
  const ms = grp('master_suite', joinery);
  const bed = (pre, x0, y0, x1, y1, headSide, parent, duvetMat = M.linen, throwMat = M.clay) => {
    // headSide: 'n' | 'e' — headboard against that wall
    const g = grp(pre, parent);
    if (headSide === 'n') {
      rbox(pre + '_headboard', M.bed, x0 - 2, y0, x1 + 2, y0 + 5, 0.05, 1.15, 0.04, g);
      rbox(pre + '_base', M.bed, x0, y0 + 5, x1, y1, 0.08, 0.42, 0.04, g);
      rbox(pre + '_mattress', M.linen, x0 + 1, y0 + 6, x1 - 1, y1 - 1, 0.42, 0.64, 0.05, g);
      rbox(pre + '_duvet', duvetMat, x0 + 0.5, y0 + 30, x1 - 0.5, y1 - 0.5, 0.6, 0.68, 0.06, g);
      rbox(pre + '_throw', throwMat, x0 + 0.2, y1 - 22, x1 - 0.2, y1 - 6, 0.66, 0.7, 0.04, g);
      const n = (x1 - x0) > 70 ? 2 : 1, w = (x1 - x0 - 8) / n;
      for (let i = 0; i < n; i++) rbox(pre + '_pillow_' + i, M.linen, x0 + 4 + i * w + 1, y0 + 8, x0 + 4 + (i + 1) * w - 1, y0 + 21, 0.64, 0.78, 0.06, g);
    } else {
      rbox(pre + '_headboard', M.bed, x1 - 5, y0 - 2, x1, y1 + 2, 0.05, 1.05, 0.04, g);
      rbox(pre + '_base', M.bed, x0, y0, x1 - 5, y1, 0.08, 0.42, 0.04, g);
      rbox(pre + '_mattress', M.linen, x0 + 1, y0 + 1, x1 - 6, y1 - 1, 0.42, 0.62, 0.05, g);
      rbox(pre + '_duvet', duvetMat, x0 + 0.5, y0 + 0.5, x1 - 30, y1 - 0.5, 0.58, 0.66, 0.06, g);
      const n = (y1 - y0) > 70 ? 2 : 1, w = (y1 - y0 - 8) / n;
      for (let i = 0; i < n; i++) rbox(pre + '_pillow_' + i, M.linen, x1 - 20, y0 + 4 + i * w + 1, x1 - 7, y0 + 4 + (i + 1) * w - 1, 0.62, 0.76, 0.06, g);
    }
    return g;
  };
  rbox('rug_master', M.rug, 310, 585, 435, 680, 0, 0.012, 0.01, ms);
  bed('master_bed_160x200', 327, 525.65, 418, 640, 'n', ms);
  [[296, 322], [423, 449]].forEach(([a, b], i) => {
    pbox('master_nightstand_' + i, M.oak, a, 526, b, 549, 0.38, 0.55, ms);
    pcyl('master_bedside_lamp_' + i, M.ceramic, (a + b) / 2, 537, 0.07, 0.55, 0.85, ms, 24, 0.09);
  });
  const wardrobe = (pre, x0, y0, x1, y1, faceSide, parent) => {
    const g = grp(pre, parent); pbox(pre + '_carcass_oak', M.oak, x0, y0, x1, y1, 0, 2.4, g);
    const n = Math.max(2, Math.round((x1 - x0) / 34));
    for (let i = 1; i < n; i++) { const x = x0 + (x1 - x0) * i / n; pbox(pre + '_door_reveal_' + i, M.blackMetal, x - 0.3, faceSide === 'n' ? y0 - 0.3 : y1, x + 0.3, faceSide === 'n' ? y0 : y1 + 0.3, 0.02, 2.38, g); }
    pbox(pre + '_bulkhead', M.plaster, x0, y0, x1, y1, 2.4, CEIL, g);
    return g;
  };
  wardrobe('master_wardrobe', 290, 690, 452, 724.07, 'n', ms);
  pbox('master_sheer_curtain', M.sheer, 287, 576, 289, 600, 0.02, 2.55, ms);
  pbox('master_curtain_track', M.blackMetal, 286.5, 575, 289.5, 674, 2.55, 2.58, ms);
  plant('plant_master', 302, 563, 0.15, 0.4, 0.7, ms);

  // MASTER BATH (shower) — corner shower on a sloped floor, rain head + hand shower on rail,
  // vanity ≤100 cm with integral basin + mirror, wall-hung WC with concealed cistern, tiles to ceiling
  const mb = grp('master_bath', wet);
  pbox('mb_shower_glass_front', M.glass, 521, 662.5, 569, 663.7, 0, 2.0, mb);
  pbox('mb_shower_glass_side', M.glass, 520.4, 616.35, 521.6, 663.7, 0, 2.0, mb);
  pbox('mb_shower_glass_profile', M.chrome, 520, 662, 522, 664.2, 0, 2.0, mb);
  pbox('mb_shower_linear_drain', M.steelSS, 524, 657, 566, 659.5, 0.001, 0.003, mb);
  pcyl('mb_rain_shower_head', M.chrome, 545, 640, 0.12, 2.12, 2.135, mb, 40);
  pbox('mb_rain_arm', M.chrome, 545, 617, 546, 640, 2.135, 2.15, mb);
  pbox('mb_hand_shower_rail', M.chrome, 567.8, 628, 569, 629, 0.95, 1.95, mb);
  pbox('mb_hand_shower', M.chrome, 566, 627.2, 567.8, 629.8, 1.55, 1.75, mb);
  pbox('mb_diverter_mixer_4way', M.chrome, 567.8, 634, 569, 646, 1.0, 1.12, mb);
  pbox('mb_vanity_formica', M.oak, 464.12, 616.35, 511, 643, 0.45, 0.84, mb);
  pbox('mb_vanity_integral_basin', M.ceramic, 464.12, 616.35, 511.5, 643.5, 0.84, 0.86, mb);
  pbox('mb_basin_bowl', M.ceramic, 478, 622, 497, 638, 0.855, 0.862, mb).material = M.ceramic;
  pcyl('mb_basin_mixer', M.chrome, 487.5, 619.5, 0.016, 0.86, 1.0, mb, 20); pbox('mb_basin_spout', M.chrome, 486.8, 619.5, 488.2, 627, 0.97, 0.99, mb);
  pbox('mb_mirror', M.mirror, 466, 616.4, 509, 617.2, 1.05, 1.85, mb);
  pbox('mb_concealed_cistern', M.wallTile, 554, 676, 569, 709.9, 0, 1.12, mb);
  pbox('mb_flush_plate_dual', M.chrome, 553.6, 688, 554, 698, 0.95, 1.05, mb);
  rbox('mb_wc_wall_hung', M.ceramic, 527, 684, 554, 701, 0.2, 0.42, 0.08, mb);
  pbox('mb_towel_rail', M.chrome, 466, 700, 467, 716, 1.2, 1.22, mb);

  // BEDROOM 3 — bed head on the east wall, wardrobe on the north wall
  const b3 = grp('bedroom3', joinery);
  bed('bedroom3_bed_120x200', 620, 640, 733.4, 708, 'e', b3, M.linen, M.clay);
  pbox('bedroom3_nightstand', M.oak, 708, 620, 733, 638, 0.35, 0.55, b3);
  wardrobe('bedroom3_wardrobe', 625, 553.99, 733.4, 588, 's', b3);
  rbox('rug_bedroom3', M.rug, 600, 640, 650, 712, 0, 0.012, 0.01, b3);
  pbox('bedroom3_sheer_curtain', M.sheer, 627, 721, 640, 723, 0.02, 2.55, b3);

  // GENERAL BATH (bathtub) — acrylic tub 170x70, 4-way mixer + hand shower on rail, vanity ≤120 cm, wall-hung WC
  const gbth = grp('general_bath', wet);
  const TX0 = 1011, TY0 = 622, TX1 = 1050.87, TY1 = 718.4;
  pbox('bathtub_apron_tiled', M.wallTile, TX0, TY0, TX1, TY1, 0, 0.5, gbth);
  pbox('bathtub_rim_acrylic', M.ceramic, TX0 + 1, TY0 + 1, TX1, TY1, 0.5, 0.56, gbth);
  pbox('bathtub_basin_inner', M.ceramic, TX0 + 4, TY0 + 4, TX1 - 3, TY1 - 3, 0.557, 0.562, gbth).material = M.mirror.clone();
  gbth.children[gbth.children.length - 1].material.color.set(0xe9eef0); gbth.children[gbth.children.length - 1].material.name = 'bath_water_still';
  pbox('bath_mixer_4way', M.chrome, 1049.7, 664, 1050.87, 676, 0.72, 0.82, gbth);
  pbox('bath_spout', M.chrome, 1043, 668.5, 1050.87, 671.5, 0.66, 0.69, gbth);
  pbox('bath_hand_shower_rail', M.chrome, 1049.7, 690, 1050.87, 691, 0.9, 1.9, gbth);
  pbox('bath_hand_shower', M.chrome, 1047.8, 689.2, 1049.7, 691.8, 1.5, 1.7, gbth);
  pbox('bath_shower_curtain_rod', M.chrome, TX0, TY0 - 0.5, TX1, TY0 + 0.5, 2.0, 2.02, gbth);
  pbox('bath_vanity_120', M.oak, 1024, 556, 1050.87, 612, 0.45, 0.84, gbth);
  pbox('bath_vanity_integral_basin', M.ceramic, 1023.5, 556, 1050.87, 612, 0.84, 0.86, gbth);
  pbox('bath_basin_bowl', M.ceramic, 1029, 572, 1046, 596, 0.855, 0.862, gbth);
  pcyl('bath_basin_mixer', M.chrome, 1048, 584, 0.016, 0.86, 1.0, gbth, 20); pbox('bath_basin_spout', M.chrome, 1040, 583.3, 1048, 584.7, 0.97, 0.99, gbth);
  pbox('bath_mirror', M.mirror, 1050, 558, 1050.87, 610, 1.05, 1.85, gbth);
  pbox('bath_concealed_cistern', M.wallTile, 972, 704, 1000, 718.4, 0, 1.12, gbth);
  pbox('bath_flush_plate', M.chrome, 981, 703.6, 991, 704, 0.95, 1.05, gbth);
  rbox('bath_wc_wall_hung', M.ceramic, 977, 677, 995, 704, 0.2, 0.42, 0.08, gbth);
  pbox('bath_shaft_box', M.wallTile, 960.17, 705, 971.5, 718.4, 0, DROP, gbth);
  pbox('bath_towel_rail', M.chrome, 961, 640, 962, 660, 1.2, 1.22, gbth);

  // GUEST WC — wall-hung WC + small hand basin (cold water only)
  const wc = grp('guest_wc', wet);
  pbox('wc_concealed_cistern', M.wcTile, 739.07, 566, 753, 598, 0, 1.12, wc);
  pbox('wc_flush_plate', M.chrome, 753, 576, 753.4, 586, 0.95, 1.05, wc);
  rbox('wc_wall_hung', M.ceramic, 753, 572.5, 780, 589.5, 0.2, 0.42, 0.08, wc);
  rbox('wc_hand_basin', M.ceramic, 793, 608, 816, 622, 0.78, 0.86, 0.03, wc);
  pcyl('wc_hand_basin_tap_cold', M.chrome, 804.5, 620, 0.012, 0.86, 0.98, wc, 16); pbox('wc_tap_spout', M.chrome, 804, 614, 805, 620, 0.955, 0.97, wc);
  pbox('wc_mirror', M.mirror, 795, 621.2, 814, 622, 1.05, 1.6, wc);

  // SERVICE BALCONY — washer + dryer connections (dryer vent 4"), 60x60 floor
  const svc = grp('service_balcony', wet);
  pbox('washing_machine', M.appliance, 685, 256.4, 719, 290, 0, 0.85, svc);
  { const d = pcyl('washer_door', M.blackGlass, 702, 290.2, 0.15, 0.4, 0.42, svc, 32); d.rotation.x = PI / 2; d.position.y = 0.45; }
  pbox('dryer', M.appliance, 722, 256.4, 756, 290, 0, 0.85, svc);
  { const d = pcyl('dryer_door', M.blackGlass, 739, 290.2, 0.15, 0.4, 0.42, svc, 32); d.rotation.x = PI / 2; d.position.y = 0.45; }
  pbox('service_worktop', M.caesar, 683, 255.5, 758.9, 292, 0.85, 0.88, svc);
  pcyl('dryer_vent_4in', M.alu, 739, 254.2, 0.05, 1.8, 1.9, svc, 24).rotation.x = PI / 2;
  pbox('service_shelf', M.oak, 683, 253.53, 758.9, 266, 1.9, 1.93, svc);
  pbox('service_shaft_box', M.wallTile, 659.7, 332.33, 673.87, 346.5, 0, DROP, svc);

  // MISTOR (laundry / systems screen) — 150 L water heater, systems, 2 telescopic laundry bars
  const mis = grp('mistor_laundry_systems', wet);
  pcyl('water_heater_150L', M.appliance, 597, 309, 0.27, 0.35, 1.75, mis, 40);
  pbox('water_heater_stand', M.alu, 586, 298, 608, 320, 0, 0.35, mis);
  pbox('systems_unit_outdoor', M.appliance, 560, 258, 580, 322, 0.3, 1.25, mis);
  pbox('systems_unit_grille', M.hvac, 580, 270, 580.5, 310, 0.45, 1.1, mis);
  [612, 642].forEach((x, i) => pbox('laundry_bar_' + i, M.alu, x - 1, 256, x + 1, 330, 2.05, 2.08, mis));
  for (let y = 264; y < 330; y += 12) pbox('laundry_line', M.linen, 612, y - 0.2, 642, y + 0.2, 2.03, 2.04, mis);

  // MAMAD (bedroom 2 / study) — HFC filter unit, steel door + inner wood door
  const mmd = grp('mamad_bedroom2', joinery);
  bed('mamad_bed_140x200', 824, 705, 937.49, 785, 'e', mmd, M.clay, M.linen);
  wardrobe('mamad_wardrobe', 760, 636.2, 872, 670, 's', mmd);
  pbox('mamad_desk_top', M.oak, 756.08, 742, 787, 808, 0.72, 0.75, mmd);
  pbox('mamad_desk_leg', M.oak, 756.08, 805, 787, 808, 0, 0.72, mmd);
  chair('mamad_desk_chair', 800, 775, [-1, 0], mmd);
  pbox('mamad_hfc_air_filter_unit', M.steel, 756.1, 690, 760, 724, 1.75, 2.25, mmd);
  pcyl('mamad_filter_duct', M.steel, 758, 707, 0.05, 2.25, CEIL, mmd, 16);
  pbox('mamad_nightstand', M.oak, 913, 688, 936, 704, 0.35, 0.55, mmd);

  // SUN BALCONY (covered, 9.7 m²) — gas point, garden tap, IP44 socket
  const bal = grp('sun_balcony', joinery);
  pcyl('balcony_table_teak', M.teak, 340, 420, 0.42, 0.7, 0.74, bal, 48); pcyl('balcony_table_base', M.teak, 340, 420, 0.06, 0, 0.7, bal, 16);
  [[310, 420, [1, 0]], [370, 420, [-1, 0]], [340, 390, [0, 1]], [340, 452, [0, -1]]].forEach(([x, y, f], i) => chair('balcony_chair_' + i, x, y, f, bal));
  rbox('balcony_lounger_frame', M.teak, 395, 345, 440, 450, 0.0, 0.32, 0.03, bal);
  rbox('balcony_lounger_cushion', M.outdoor, 397, 347, 438, 448, 0.32, 0.4, 0.04, bal);
  pbox('planter_box_balcony', M.planter, 278, 340, 296, 500, 0, 0.5, bal);
  for (let y = 348; y < 496; y += 13) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14 + rnd() * 0.07, 1), rnd() > 0.5 ? M.foliage : M.foliageDark); s.name = 'planter_shrub'; s.position.set(ux(287), 0.58 + rnd() * 0.1, uz(y)); bal.add(s); }
  pbox('balcony_gas_point', M.gasValve, 405, 504, 409, 505.81, 0.5, 0.56, bal);
  pbox('balcony_garden_tap', M.chrome, 446, 503.6, 449.5, 505.81, 0.6, 0.64, bal);

  // ---------- wall tiling to ceiling in wet rooms (spec: "חיפוי קירות לגובה תקרה") ----------
  // clad(rect, side, gaps[[a0,a1,h0,h1]]) — panels just inside the room, skipping openings
  const clad = (name, mat, r, side, gaps, top, parent) => {
    const [x0, y0, x1, y1] = r, t = 0.7;
    const along = side === 'n' || side === 's' ? [x0, x1] : [y0, y1];
    const cuts = [along[0], ...gaps.flatMap((gp) => [gp[0], gp[1]]), along[1]].sort((a, b) => a - b);
    const put = (a0, a1, h0, h1, k) => {
      if (a1 - a0 < 0.5 || h1 - h0 < 0.01) return;
      if (side === 'n') pbox(name + k, mat, a0, y0, a1, y0 + t, h0, h1, parent);
      if (side === 's') pbox(name + k, mat, a0, y1 - t, a1, y1, h0, h1, parent);
      if (side === 'w') pbox(name + k, mat, x0, a0, x0 + t, a1, h0, h1, parent);
      if (side === 'e') pbox(name + k, mat, x1 - t, a0, x1, a1, h0, h1, parent);
    };
    for (let i = 0; i < cuts.length - 1; i++) {
      const a0 = cuts[i], a1 = cuts[i + 1], gp = gaps.find((q) => q[0] <= a0 + 0.01 && q[1] >= a1 - 0.01);
      if (!gp) put(a0, a1, 0, top, '_' + i);
      else { put(a0, a1, 0, gp[2], '_' + i + 'b'); put(a0, a1, gp[3], top, '_' + i + 't'); }
    }
  };
  const tiles = grp('wall_tiling', wet);
  const mbR = [464.12, 616.35, 569.0, 724.07], gbR = [960.17, 553.99, 1050.87, 718.4], wcR = [739.07, 553.99, 826.94, 622.02];
  clad('mb_tiles_n', M.wallTile, mbR, 'n', [], DROP, tiles); clad('mb_tiles_e', M.wallTile, mbR, 'e', [], DROP, tiles);
  clad('mb_tiles_s', M.wallTile, mbR, 's', [[506.63, 546.32, 0, 2.2]], DROP, tiles); clad('mb_tiles_w', M.wallTile, mbR, 'w', [[673.04, 718.4, 0, 2.1]], DROP, tiles);
  clad('gb_tiles_n', M.wallTile, gbR, 'n', [], DROP, tiles); clad('gb_tiles_e', M.wallTile, gbR, 'e', [], DROP, tiles);
  clad('gb_tiles_s', M.wallTile, gbR, 's', [], DROP, tiles); clad('gb_tiles_w', M.wallTile, gbR, 'w', [[562.5, 607.85, 0, 2.1]], DROP, tiles);
  clad('wc_tiles_n', M.wcTile, wcR, 'n', [], DROP, tiles); clad('wc_tiles_s', M.wcTile, wcR, 's', [], DROP, tiles);
  clad('wc_tiles_w', M.wcTile, wcR, 'w', [], DROP, tiles); clad('wc_tiles_e', M.wcTile, wcR, 'e', [[562.5, 607.85, 0, 2.1]], DROP, tiles);

  // ---------- electrical points per spec table 5 (positions illustrative — final per electrical plan) ----------
  const outlets = [];
  const pt = (name, x, y, h, face, kind = 'socket') => {
    // face: wall normal direction the plate faces ('n','s','e','w')
    const w = kind === 'tv' ? 4.5 : 4.5, d = 0.6;
    const r = face === 'n' || face === 's' ? [x - w / 2, y - d / 2, x + w / 2, y + d / 2] : [x - d / 2, y - w / 2, x + d / 2, y + w / 2];
    const m = pbox('elec_' + kind + '_' + name, M.plate, r[0], r[1], r[2], r[3], h - 0.04, h + 0.04, elec);
    m.userData.kind = kind; outlets.push(m);
  };
  // living (5 sockets + TV + communications)
  pt('living_1', 556, 352.6, 0.35, 's'); pt('living_2', 668, 352.6, 0.35, 's'); pt('living_3', 600, 547.9, 0.35, 'n'); pt('living_4', 720, 547.9, 0.35, 'n'); pt('living_5', 470.2, 520, 0.35, 'e');
  pt('living_tv', 612, 352.6, 0.4, 's', 'tv'); pt('living_comm', 625, 352.6, 0.4, 's', 'tv');
  pt('dining_1', 860, 547.9, 0.35, 'n');
  // kitchen: 3 regular over the worktop, 3 separate circuits, 1 IP44, 1 three-phase for the hob
  pt('kitchen_1', 786, 256.8, 1.1, 's'); pt('kitchen_2', 870, 256.8, 1.1, 's'); pt('kitchen_3', 945, 256.8, 1.1, 's');
  pt('kitchen_ip44', 812, 256.8, 1.15, 's', 'ip44');
  pt('kitchen_circuit_fridge', 1030, 256.8, 2.0, 's', 'circuit'); pt('kitchen_circuit_dishwasher', 852, 256.8, 0.3, 's', 'circuit'); pt('kitchen_circuit_oven', 980, 256.8, 0.3, 's', 'circuit');
  pt('kitchen_3phase_hob', 906, 256.8, 0.6, 's', 'power');
  // bedrooms
  pt('master_1', 300, 526.1, 0.45, 's'); pt('master_2', 444, 526.1, 0.45, 's'); pt('master_3', 286, 685, 0.35, 'e'); pt('master_tv', 286, 676, 0.4, 'e', 'tv');
  pt('bedroom3_1', 732.9, 625, 0.45, 'w'); pt('bedroom3_2', 575.1, 650, 0.35, 'e'); pt('bedroom3_3', 600, 723.6, 0.35, 'n'); pt('bedroom3_tv', 575.1, 640, 0.4, 'e', 'tv');
  pt('mamad_1', 937, 695, 0.45, 'w'); pt('mamad_2', 937, 795, 0.45, 'w'); pt('mamad_3', 756.5, 735, 0.85, 'e'); pt('mamad_filter', 756.5, 728, 1.8, 'e', 'circuit'); pt('mamad_tv', 860, 811.5, 0.4, 'n', 'tv');
  // wet rooms: heater circuits (water heater / towel heater), service balcony 2 circuits
  pt('master_bath_heater', 568.4, 700, 1.8, 'w', 'circuit'); pt('general_bath_heater', 961, 620, 1.8, 'e', 'circuit');
  pt('service_washer', 700, 254, 1.1, 's', 'circuit'); pt('service_dryer', 745, 254, 1.1, 's', 'circuit');
  pt('balcony_ip44', 430, 505.3, 0.4, 'n', 'ip44');
  pt('entrance_intercom_panel', 1053.2, 470, 1.5, 'w', 'comm');

  // practical lights (not exported) — warm 3000K pools at the spec's light points
  const fx = new THREE.Group();
  LP.forEach(([n, x, y, h]) => {
    if (n === 'sun_balcony_wall') { const l = new THREE.PointLight(0xffc996, 1.2, 4, 2); l.position.set(ux(305), 2.1, uz(500)); fx.add(l); return; }
    const l = new THREE.SpotLight(0xffc996, n.startsWith('living') ? 14 : 11, 6, 0.95, 0.85, 2); l.position.set(ux(x), h - 0.03, uz(y));
    l.target.position.set(ux(x), 0, uz(y)); fx.add(l); fx.add(l.target);
  });
  [[825, 275], [935, 275]].forEach(([x, y]) => { const l = new THREE.PointLight(0xffd2a0, 0.5, 1.6, 2); l.position.set(ux(x), 1.44, uz(y)); fx.add(l); });

  // ---------- spec options ----------
  const setShutters = (t) => {
    shutters.forEach((m) => { m.scale.y = Math.max(0.001, t * m.userData.full); m.visible = t > 0.01; });
    mamadSteel.position.z = mamadSteel.userData.y0 - (1 - t) * 56.69 * K;
  };
  setShutters(0);
  const porcelainRough = M.porcelain.roughnessMap;
  const setTile = (w, h) => { porcelainTex.repeat.set(1 / w, 1 / h); porcelainRough.repeat.set(1 / w, 1 / h); };
  setTile(0.8, 0.8);
  const setParquet = (on) => { masterFloor.material = on ? parquetMat : M.porcelain; };
  const setOutlets = (on) => { outlets.forEach((m) => { m.material = on ? M.plateHi : M.plate; m.scale.set(on ? 1.6 : 1, on ? 1.6 : 1, on ? 1.6 : 1); }); };

  // =====================================================================
  // MODEL 2 — TOWER T3 (32 residential floors) + neighbouring T4 (16), from the 1:100 floor sheets
  // =====================================================================
  const bld = new THREE.Group(); bld.name = 'T3_T4_massing';
  const KB = K * 2, BCX = 1875, BCY = 800, TXU = 1268.631, TYU = 536.5825;   // unit sheet → building sheet: b = u/2 + T
  const bx = (x) => (x - BCX) * KB, bz = (y) => (y - BCY) * KB;
  const G0 = 5.0, FTF = 3.2, SL = 0.3;   // assumed (no section in the set): ground 5.0 m, floor-to-floor 3.20 m
  const base = (L) => (L === 0 ? 0 : G0 + (L - 1) * FTF);
  const bExtrude = (polys, h) => extrudeGeo(polys.map((p) => shape(p, bx, bz)), h);
  const insetPoly = (pts, d) => {
    let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
    const sgn = a > 0 ? 1 : -1, n = pts.length, out = [];
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
      const e1 = [p1[0] - p0[0], p1[1] - p0[1]], e2 = [p2[0] - p1[0], p2[1] - p1[1]];
      const l1 = Math.hypot(...e1) || 1, l2 = Math.hypot(...e2) || 1;
      const n1 = [-e1[1] / l1 * sgn, e1[0] / l1 * sgn], n2 = [-e2[1] / l2 * sgn, e2[0] / l2 * sgn];
      const dot = n1[0] * n2[0] + n1[1] * n2[1]; const f = d / Math.max(1 + dot, 0.3);
      out.push([p1[0] + (n1[0] + n2[0]) * f, p1[1] + (n1[1] + n2[1]) * f]);
    }
    return out;
  };
  const distToPolys = (pt, polys) => {
    let best = 1e9; for (const poly of polys) for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length]; const dx = b[0] - a[0], dy = b[1] - a[1];
      const t = Math.max(0, Math.min(1, ((pt[0] - a[0]) * dx + (pt[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
      best = Math.min(best, Math.hypot(pt[0] - a[0] - t * dx, pt[1] - a[1] - t * dy));
    } return best;
  };
  const inPoly = (x, y, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if (((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c; } return c; };
  const planGeo = (D) => {
    const railG = new THREE.Group();
    for (const b of D.balc) for (let i = 0; i < b.length; i++) {
      const p = b[i], q = b[(i + 1) % b.length]; const len = Math.hypot(q[0] - p[0], q[1] - p[1]) * KB; if (len < 0.4) continue;
      if (distToPolys([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], D.env) < 3) continue;   // edge touches the façade
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, 1.05, 0.03), M.rglass); m.name = 'balustrade_glass';
      m.position.set(bx((p[0] + q[0]) / 2), 0.6, bz((p[1] + q[1]) / 2)); m.rotation.y = -Math.atan2(q[1] - p[1], q[0] - p[0]); railG.add(m);
    }
    return {
      slab: bExtrude([...D.env, ...D.balc], SL), walls: bExtrude(D.walls, FTF - SL), glass: bExtrude(D.env.map((e) => insetPoly(e, 1.5)), FTF - SL - 0.04),
      soffit: D.balc.length ? bExtrude(D.balc, 0.02) : null, rail: railG,
    };
  };
  const plansOf = (B) => { const o = {}; for (const k in B) o[k] = planGeo(B[k]); return o; };
  const T3P = plansOf(bldPt.T3), T4P = plansOf(bldPt.T4);
  const keyFor = (P, L) => Object.keys(P).map(Number).filter((k) => k <= L).sort((a, b) => b - a)[0];
  const floorMesh = (p, L, parent, tag) => {
    const g = grp(tag + '_floor_' + L, parent), y = base(L);
    placeExtrude(p.slab, M.band, 'slab', y - SL, g);
    placeExtrude(p.walls, M.facade, 'facade_walls', y, g);
    placeExtrude(p.glass, M.fglass, 'glazing', y + 0.02, g);
    const r = p.rail.clone(); r.name = 'balustrades'; r.position.y = y; g.add(r);
    return g;
  };
  const tower = (P, NF, tag, parent, Ls, swap) => {
    const g = grp(tag, parent);
    for (const L of Ls ?? Array.from({ length: NF }, (_, i) => i + 1)) {
      if (swap && swap[L]) { floorMesh(swap[L], L, g, tag); continue; }
      floorMesh(P[keyFor(P, L)], L, g, tag);
    }
    return g;
  };
  const groundFloor = (D, tag, parent) => {
    const gf = grp(tag + '_ground_floor_lobby_commercial', parent);
    placeExtrude(bExtrude(D.env.map((e) => insetPoly(e, 6)), G0 - SL - 0.06), M.fglass, 'ground_glazing', 0.03, gf);
    const e = insetPoly(D.env[0], 4);
    e.forEach((q, i) => { if (i % 2) return; const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, G0 - SL, 0.5), M.facade); m.name = 'ground_pier_' + i; m.position.set(bx(q[0]), (G0 - SL) / 2, bz(q[1])); gf.add(m); });
    return gf;
  };
  const roof = (D, NF, tag, parent, tech) => {
    const rf = grp(tag + '_roof', parent), top = base(NF) + FTF;
    placeExtrude(bExtrude(D.env, SL), M.band, 'roof_slab', top - SL, rf);
    placeExtrude(bExtrude(D.env.map((e) => insetPoly(e, 1)), 0.02), M.roof, 'roof_membrane', top, rf);
    const par = []; D.env.forEach((e) => { const s = shape(e, bx, bz); s.holes.push(new THREE.Path(insetPoly(e, 6).map((p) => new THREE.Vector2(bx(p[0]), -bz(p[1]))).reverse())); par.push(s); });
    placeExtrude(new THREE.ExtrudeGeometry(par, { depth: 1.1, bevelEnabled: false }), M.facade, 'roof_parapet', top, rf);
    if (tech) {
      placeExtrude(bExtrude(tech.walls, 3.6), M.facade, 'technical_roof_rooms_water_tanks', top, rf);
      placeExtrude(bExtrude(tech.env, 0.25), M.band, 'technical_roof_cap', top + 3.6, rf);
      // solar water-heating collectors (spec 3.6.2) — layout indicative
      const env = D.env[0], tenv = tech.env[0];
      let n = 0; const xs = env.map((p) => p[0]), ys = env.map((p) => p[1]);
      for (let x = Math.min(...xs) + 20; x < Math.max(...xs) - 20; x += 34) for (let y = Math.min(...ys) + 20; y < Math.max(...ys) - 20; y += 40) {
        if (!inPoly(x, y, env) || inPoly(x, y, insetPoly(tenv, -20)) || distToPolys([x, y], [env]) < 18) continue;
        const m = new THREE.Mesh(new THREE.BoxGeometry(30 * KB, 0.06, 2.0), M.solar); m.name = 'solar_collector_' + n++;
        m.position.set(bx(x), top + 0.7, bz(y)); m.rotation.x = 0.5; rf.add(m);
      }
    }
    return rf;
  };
  const NF3 = 32, NF4 = 16;
  tower(T3P, NF3, 'T3', bld); tower(T4P, NF4, 'T4', bld);
  groundFloor(bldPt.T3['2'], 'T3', bld); groundFloor(bldPt.T4['2'], 'T4', bld);
  const roofTop = base(NF3) + FTF;
  roof(bldPt.T3['32'], NF3, 'T3', bld, bldPt.T3roof); roof(bldPt.T4['16'], NF4, 'T4', bld);
  { const site = new THREE.Mesh(new THREE.BoxGeometry((2400 - 380) * KB + 20, 0.12, (1340 - 270) * KB + 20), M.paving); site.name = 'site_paving'; site.position.set(bx(1390), -0.06, bz(805)); bld.add(site); }
  // highlight volume for the chosen unit (x-ray through the façade)
  const hlGeo = bExtrude([bldPt.unitFootprint, bldPt.unitBalcony], FTF - SL - 0.04);
  const hl = grp('target_unit_T3-D3', bld);
  const hlMesh = placeExtrude(hlGeo, M.highlight, 'target_unit_volume', 0, hl); hlMesh.renderOrder = 10; hlMesh.userData.noShadow = true;
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xd2541f, depthTest: false, transparent: true }); edgeMat.name = 'unit_highlight_outline';
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(hlGeo, 20), edgeMat); edges.name = 'target_unit_outline'; edges.rotation.x = -PI / 2; edges.renderOrder = 11; hl.add(edges);
  const setFloor = (L) => { const y = base(L) + 0.02; hlMesh.position.y = y; edges.position.y = y; };
  setFloor(23);

  // ---- surroundings for the walk-through: the rest of floor 23, floors above/below, T4, the ground ----
  const TARGET = 23;
  const ctx = new THREE.Group(); ctx.name = 'context_view_from_floor_23';
  ctx.position.set(-(2 * TXU - 2 * BCX + UCX) * K, -base(TARGET), -(2 * TYU - 2 * BCY + UCY) * K);
  const ctxP = planGeo(bldPt.ctx);
  const LsAround = []; for (let L = TARGET - 6; L <= TARGET + 6; L++) LsAround.push(L);
  tower(T3P, NF3, 'ctx_T3', ctx, LsAround, { [TARGET]: ctxP });
  tower(T4P, NF4, 'ctx_T4', ctx); roof(bldPt.T4['16'], NF4, 'ctx_T4', ctx); groundFloor(bldPt.T4['2'], 'ctx_T4', ctx);
  { const g = new THREE.Mesh(new THREE.CircleGeometry(1400, 48), std('city_ground', 0xb4b0a4, 0.95)); g.rotation.x = -PI / 2; g.position.y = -0.05; g.name = 'ground'; ctx.add(g); }
  ctx.traverse((o) => { if (o.isMesh) o.userData.noShadow = true; });
  fx.add(ctx);

  const P = (x, y, h) => [ux(x), h, uz(y)];
  const unitInBld = (x, y, L, h) => [bx(x * 0.5 + TXU), base(L) + h, bz(y * 0.5 + TYU)];
  return { unit, ceil, fx, bld, setFloor, P, unitInBld, roofTop, base, K, UCX, UCY, floorsGroup: floors, ROOMS: R, setShutters, setTile, setParquet, setOutlets, footprint, NF: NF3 };
}
