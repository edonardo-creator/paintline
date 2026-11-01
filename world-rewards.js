// World collections and scarce, one-time mastery rewards.
(() => {
  'use strict';
  const ITEMS = [
    { color: '#ff759a', hue: [340, 85], skin: 'Gül Kuvars', effect: 'Pembe boya halkaları', power: 'Boya Patlaması', description: 'Topun çevresindeki dört açık karoyu boyar.', price: 6, fx: 'petals' },
    { color: '#29d9ba', hue: [166, 80], skin: 'Zümrüt Akıntı', effect: 'Yeşil akıntı dalgaları', power: 'Zaman Dalgası', description: 'Bu denemedeki hamle sayısını 3 azaltır. En az 3 hamle gerekir.', price: 7, fx: 'waves' },
    { color: '#bd8cff', hue: [272, 85], skin: 'Kozmik Ametist', effect: 'Mor yıldız tozu', power: 'Yıldız Geçidi', description: 'İlk boyanmamış açık karoya ışınlanır ve onu boyar.', price: 8, fx: 'stars' },
    { color: '#71e8ff', hue: [190, 90], skin: 'Kutup Kristali', effect: 'Mavi kristal parıltısı', power: 'Buz Zırhı', description: 'Bu deneme boyunca kırılmış buzların üzerinden geçmeni sağlar.', price: 9, fx: 'crystals' },
    { color: '#ffbf47', hue: [38, 95], skin: 'Altın Voltaj', effect: 'Altın elektrik çizgileri', power: 'Uzaktan Şalter', description: 'Bütün bariyerlerin açık/kapalı durumunu anında tersine çevirir.', price: 10, fx: 'sparks' },
    // Claude: 6. dünya (Kristal Mağara) eklendi; Codex gözden geçirsin
    { color: '#d68cff', hue: [292, 85], skin: 'Prizma Işığı', effect: 'Gökkuşağı prizma kırılmaları', power: 'Ayna Çevirme', description: 'Bu denemede bütün kristal aynaları ters yöne çevirir.', price: 11, fx: 'prism' },
    // Claude: 7. dünya (Saat Kulesi); kendi efekti 'gears' (pirinç dişliler).
    { color: '#e0a94a', hue: [38, 80], skin: 'Pirinç Mekanizma', effect: 'Altın dişli parıltısı', power: 'Zamanı Geri Sar', description: 'Bütün saat kadranlarının ibresini bir çeyrek geri çevirir.', price: 12, fx: 'gears' },
    // Claude: 8. dünya (Rüzgâr Vadisi); efekt 'breeze' (esinti çizgileri)
    { color: '#7fd0f5', hue: [198, 82], skin: 'Gökyüzü Esintisi', effect: 'Uçuşan esinti çizgileri', power: 'Rüzgârı Çevir', description: 'Bu denemede bütün rüzgâr kapılarının yönünü tersine çevirir.', price: 13, fx: 'breeze' },
  ];
  const SKIN_PRICE = 12;
  // Claude: hazine listesinde karşılığı olmayan bir dünya eklenirse oyun çökmesin; güç düğmesi o dünyada kapalı kalır
  const itemOf = w => ITEMS[w] || { ...ITEMS[0], skin: '', power: 'Güç', description: 'Bu dünyanın gücü hazırlanıyor.', fx: '' };
  const STREAK_BONUS = 3; // Claude: günün bulmacasında her 7 günlük seride +3 jeton
  const shop = document.createElement('div');
  shop.id = 'rewardShop'; shop.className = 'reward-shop'; shop.hidden = true;
  // Claude: mağaza ekranı kart tabanlı yeniden tasarlandı (cüzdan, kazanma rehberi, renk seti ve güç kartları,
  // katlanır kurallar). Düğmelerin erişilebilir adları ("Seti al · 12 ◈", "1 kullanım al · N ◈") testler için korunuyor.
  shop.innerHTML = `<section class="reward-panel" role="dialog" aria-modal="true" aria-labelledby="rewardTitle" tabindex="-1">
    <header class="rw-head"><div><small>Ustalık koleksiyonu</small><h2 id="rewardTitle">Dünya hazineleri</h2></div>
      <button class="btn icon rw-close" id="rewardClose" aria-label="Kapat"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>
    <div class="rw-wallet" id="rewardBalance"></div>
    <ol class="rw-earn" aria-label="Jeton nasıl kazanılır">
      <li><span class="rw-earn-ico rw-stars">★★★</span><b>+1</b><small>Bölümü ilk kez kusursuz bitir</small></li>
      <li><span class="rw-earn-ico">100%</span><b>+5</b><small>Bir dünyanın bütün yıldızları</small></li>
      <li class="rw-zero"><span class="rw-earn-ico">İpucu · güç</span><b>0</b><small>Yardımlı çözüm jeton vermez</small></li>
    </ol>
    <div id="rewardItems">
      <h3 class="rw-sec">Renk setleri <small>Kalıcı · top, boya ve efekt</small></h3>
      <div class="rw-row" id="rewardSkins"></div>
      <h3 class="rw-sec">Güçler <small>Tek kullanımlık · kendi dünyasında</small></h3>
      <div class="rw-grid" id="rewardPowers"></div>
    </div>
    <p id="rewardMessage" role="status" aria-live="polite"></p>
    <details class="rw-rules"><summary>Kurallar</summary><ul>
      <li>Jeton yalnızca bir bölümü <b>ilk kez</b>, ipucu ya da güç kullanmadan 3 yıldızla bitirince gelir; tekrar oynamak jeton vermez.</li>
      <li>Renk setleri kalıcıdır; istediğin zaman kuşanıp çıkarabilirsin.</li>
      <li>Güçler tek kullanımlıktır, yalnızca kendi dünyasında ve her denemede bir kez kullanılır. Günün bulmacasında kapalıdır.</li>
      <li>Güç kullanılan deneme en fazla 2 yıldız alır. Geri alma gücün etkisini geri çevirir ama harcanan hakkı iade etmez.</li>
    </ul></details>
  </section>`;
  document.body.appendChild(shop);
  const bar = document.createElement('div'); bar.className = 'reward-bar';
  bar.innerHTML = '<button class="btn" id="rewardOpen">◈ <span id="rewardCoins">0</span> · Mağaza</button><button class="btn" id="rewardUse">Güç</button>';
  $('board').after(bar);
  const titleButton = document.createElement('button'); titleButton.className = 'btn'; titleButton.textContent = '◈ Dünya hazineleri';
  $('bLevels').after(titleButton);

  function economy() {
    if (!save.rewards || save.rewards.version !== 1) {
      save.rewards = { version: 1, coins: 0, claimed: {}, worlds: {}, skins: {}, equipped: {}, stock: {} };
      // Existing perfect scores earn their rewards once when upgrading.
      for (let i = 0; i < LEVELS.length; i++) if (starsOf(i) === 3) {
        save.rewards.claimed[i] = true; save.rewards.coins++;
      }
      grantWorldBonuses(); persist();
    }
    return save.rewards;
  }
  function grantWorldBonuses() {
    const r = save.rewards; let earned = 0;
    WORLDS.forEach((w, n) => {
      if (!r.worlds[n] && LEVELS.slice(w.from, w.to + 1).every((_, j) => r.claimed[w.from + j])) {
        r.worlds[n] = true; r.coins += 5; earned += 5;
      }
    });
    return earned;
  }
  function canUse() {
    if (!L || L.daily || L.rush || L.master || L.anim || L.won || L.powerUsed) return false;
    const w = L.world;
    if (w === 0) return neighbors().some(k => !L.painted[k]);
    if (w === 1) return L.moves >= 3;
    if (w === 2) return teleportTarget() >= 0;
    if (w === 3) return L.tile.includes('x');
    if (w === 4) return L.tile.some(c => c === 'g' || c === 'h');
    if (w === 5) return L.tile.some(c => MIRRORS[c]);
    if (w === 6) return L.tile.some(c => ROT[c]);
    if (w === 7) return L.tile.some(c => GATES[c]); // Claude
    return false;
  }
  function neighbors() {
    const { x, y } = xy(L, L.pos);
    return Object.values(DIRS).map(([dx, dy]) => [x + dx, y + dy])
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < L.w && ny < L.h)
      .map(([nx, ny]) => ny * L.w + nx)
      .filter(k => !blockedAt(L, k, L.painted[k], L.sw));
  }
  function teleportTarget() {
    return L.tile.findIndex((c, k) => !L.painted[k] && !blockedAt(L, k, false, L.sw) && (c === '.' || c === 'o'));
  }
  function sync() {
    const r = economy(), w = L ? L.world : 0;
    $('rewardCoins').textContent = r.coins;
    $('rewardUse').textContent = `${itemOf(w).power} · ${r.stock[w] || 0}`;
    $('rewardUse').disabled = !(r.stock[w] > 0) || !canUse();
    $('rewardUse').hidden = !!L?.daily || !!L?.rush || !!L?.master || !(r.stock[w] > 0);
    $('rewardUse').title = itemOf(w).description;
  }
  function applyCollection() {
    if (!L) return;
    const w = L.world, item = itemOf(w), active = economy().equipped[w];
    $('board').dataset.collection = active ? item.fx : '';
    $('board').style.setProperty('--collection-color', item.color);
    L.baseRewardHue ||= L.hue.slice();
    L.hue = active ? item.hue : L.baseRewardHue;
    const root = document.documentElement.style;
    root.setProperty('--lv', hsl(L.hue, 56)); root.setProperty('--lv-strong', hsl(L.hue, 40)); root.setProperty('--lv-deep', hsl(L.hue, 31));
    // Draw palette is cached by the base renderer; invalidate through resize.
    resize(); kick();
  }
  let returnFocus;
  function openShop() {
    if (L?.anim) return;
    returnFocus = document.activeElement; shop.hidden = false; renderShop(); $('rewardClose').focus();
  }
  function closeShop() { shop.hidden = true; returnFocus?.focus(); }
  // güç simgeleri (24'lük ızgara), dünya sırasıyla
  const POWER_ICONS = [
    '<circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4M5.3 5.3l2.8 2.8M15.9 15.9l2.8 2.8M5.3 18.7l2.8-2.8M15.9 8.1l2.8-2.8"/>',
    '<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/>',
    '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6-4.5-4.1 6-.7z"/>',
    '<path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    '<path d="M13 2 5 14h6l-1 8 8-12h-6z"/>',
    '<path d="M5 19 19 5"/><path d="M14 5h5v5M10 19H5v-5"/>',
  ];
  // set önizlemesi: boyanmış bir yol, top ve setin efekt deseni
  const PREVIEW = [1, 1, 1, 0, 0, 1, 0, 1, 1];
  const preview = item => `<div class="rw-preview" data-collection="${item.fx}" aria-hidden="true">${
    PREVIEW.map((on, k) => `<i class="${on ? 'on' : ''}${k === 8 ? ' ball' : ''}"></i>`).join('')}</div>`;
  let justBought = null;
  function buyButton(label, visible, disabled, onclick) {
    const b = document.createElement('button'); b.className = 'btn rw-buy';
    b.setAttribute('aria-label', label); b.innerHTML = visible; b.disabled = disabled; b.onclick = onclick;
    return b;
  }
  function celebrate(key, msg) {
    justBought = key; $('rewardMessage').textContent = msg;
    try { SFX.world(); } catch (e) {}
  }
  function renderShop() {
    const r = economy(), reached = worldOf(unlockedUpTo());
    const perfect = Object.keys(r.claimed).filter(k => k !== 'null').length, bonuses = Object.keys(r.worlds).length;
    $('rewardBalance').innerHTML = `<span class="rw-gem" aria-hidden="true">◈</span>
      <div class="rw-coins"><b>${r.coins}</b><small>Özel jeton</small></div>
      <div class="rw-stat"><b>${perfect}</b><small>Kusursuz bölüm</small></div>
      <div class="rw-stat"><b>${bonuses}</b><small>Dünya bonusu</small></div>`;
    const skins = $('rewardSkins'), powers = $('rewardPowers');
    skins.replaceChildren(); powers.replaceChildren();
    ITEMS.slice(0, reached + 1).forEach((item, w) => {
      const W = WORLDS[w], perfectHere = Object.keys(r.claimed).filter(k => +k >= W.from && +k <= W.to).length;
      // renk seti kartı
      const card = document.createElement('article');
      card.className = 'rw-card rw-skin' + (r.equipped[w] ? ' equipped' : '');
      card.style.setProperty('--collection-color', item.color);
      card.innerHTML = `${preview(item)}<small class="rw-world">${W.name}</small><h4>${item.skin}</h4><p>${item.effect}</p>
        <span class="rw-progress">${perfectHere}/${W.to - W.from + 1} kusursuz${r.worlds[w] ? ' · bonus ✓' : ''}</span>`;
      const short = SKIN_PRICE - r.coins;
      const skinBtn = !r.skins[w]
        ? buyButton(`Seti al · ${SKIN_PRICE} ◈`, short > 0 ? `◈ ${SKIN_PRICE}<small>${short} jeton daha</small>` : `◈ ${SKIN_PRICE} · Al`, short > 0, () => {
            if (r.coins < SKIN_PRICE) return;
            r.coins -= SKIN_PRICE; r.skins[w] = true; r.equipped[w] = true;
            celebrate('skin' + w, `${item.skin} senin! Bu dünyada top ve boya artık bu renkte.`);
            persist(); applyCollection(); sync(); renderShop();
          })
        : buyButton(r.equipped[w] ? 'Kuşanıldı · Çıkar' : 'Kuşan', r.equipped[w] ? '✓ Kuşanıldı' : 'Kuşan', false, () => {
            r.equipped[w] = !r.equipped[w];
            persist(); applyCollection(); sync(); renderShop();
          });
      if (r.skins[w]) skinBtn.classList.add(r.equipped[w] ? 'on' : 'own');
      card.appendChild(skinBtn);
      card.dataset.key = 'skin' + w;
      skins.appendChild(card);
      // güç kartı
      const pc = document.createElement('article');
      pc.className = 'rw-card rw-power'; pc.dataset.key = 'power' + w;
      pc.style.setProperty('--collection-color', item.color);
      const stock = r.stock[w] || 0, need = item.price - r.coins;
      pc.innerHTML = `<div class="rw-ico" aria-hidden="true"><svg viewBox="0 0 24 24">${POWER_ICONS[w] || POWER_ICONS[0]}</svg></div>
        <div class="rw-ptext"><small class="rw-world">${W.name}</small><h4>${item.power}</h4><p>${item.description}</p></div>
        <span class="rw-stock${stock ? ' has' : ''}">Çantada ${stock}</span>`;
      pc.appendChild(buyButton(`1 kullanım al · ${item.price} ◈`, need > 0 ? `◈ ${item.price}<small>${need} jeton daha</small>` : `◈ ${item.price} · Al`, need > 0, () => {
        if (r.coins < item.price) return;
        r.coins -= item.price; r.stock[w] = (r.stock[w] || 0) + 1;
        celebrate('power' + w, `${item.power} çantada! Oyundaki güç düğmesiyle kullanabilirsin.`);
        persist(); sync(); renderShop();
      }));
      powers.appendChild(pc);
    });
    // bir sonraki dünyanın hazinesi sürpriz kalır
    if (reached + 1 < WORLDS.length) {
      const t = document.createElement('article'); t.className = 'rw-card rw-skin rw-locked';
      t.innerHTML = `<div class="rw-preview" aria-hidden="true"><span>?</span></div><small class="rw-world">Dünya ${reached + 2}</small><h4>Gizli hazine</h4><p>Yeni dünyaya ulaşınca açılır.</p>`;
      skins.appendChild(t);
    }
    if (justBought && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shop.querySelector(`[data-key="${justBought}"]`)?.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.06)', boxShadow: '0 0 0 3px var(--collection-color), 0 18px 40px -12px var(--collection-color)' }, { transform: 'scale(1)' }],
        { duration: 650, easing: 'cubic-bezier(.2,.9,.3,1.3)' });
    }
    justBought = null;
  }
  function usePower() {
    const r = economy(), w = L.world;
    if (overlayOpen() || !canUse() || !(r.stock[w] > 0)) return;
    L.history.push({ pos: L.pos, painted: L.painted.slice(), paintT: L.paintT.slice(), moves: L.moves, sw: L.sw, rewardPower: true, iceShield: !!L.iceShield, tile: L.tile.slice() });
    r.stock[w]--; L.powerUsed = true; L.queued = null;
    L.hintSeq = null; L.hintDir = null;
    const now = performance.now();
    if (w === 0) neighbors().forEach(k => paintCell(L, k, now));
    if (w === 1) L.moves -= 3;
    if (w === 2) { L.pos = teleportTarget(); L.ball = xy(L, L.pos); L.trail = []; paintCell(L, L.pos, now); }
    if (w === 3) L.iceShield = true;
    if (w === 4) L.sw ^= 1;
    if (w === 5) L.tile = L.tile.map(c => c === '/' ? '\\' : c === '\\' ? '/' : c);
    if (w === 6) L.tile = L.tile.map(c => ROT[c] ? String((+c + 2) % 4 + 1) : c); // saat yönünün tersine bir çeyrek
    if (w === 7) L.tile = L.tile.map(c => GATE_FLIP[c] || c); // Claude: rüzgâr kapıları ters yöne
    persist(); burst(L, L.ball, w === 3 ? 'rift' : w === 4 ? 'gear' : w === 5 ? 'geyser' : 'jump', now);
    if (!reduceMotion) $('board').animate([{ filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }], { duration: 650 });
    $('hint').textContent = `${itemOf(w).power} etkin · Bu denemede jeton kazanılmaz.`; $('hint').style.opacity = 1;
    SFX.toggle(); updateHud(); kick();
    if (countPainted(L) === L.floorCount) finishLevel(now);
  }
  const originalStart = startLevel;
  startLevel = function(...args) { originalStart(...args); applyCollection(); sync(); };
  const originalDaily = startDaily;
  startDaily = function(...args) { originalDaily(...args); applyCollection(); sync(); };
  // Claude: zamana karşı tahtaları da dünyanın kuşanılmış setiyle çizilir
  const originalEvent = startEvent;
  startEvent = function(...args) { originalEvent(...args); applyCollection(); sync(); };
  const originalRush = startRushBoard;
  startRushBoard = function(...args) { originalRush(...args); applyCollection(); sync(); };
  const originalUndo = undo;
  undo = function(...args) {
    const snapshot = !L.anim && !L.won && L.history.at(-1);
    originalUndo(...args);
    if (snapshot?.rewardPower) { L.iceShield = snapshot.iceShield; if (snapshot.tile) L.tile = snapshot.tile; sync(); kick(); }
  };
  // The base button stores the original function reference.
  $('bUndo').onclick = undo;
  const originalHud = updateHud;
  updateHud = function(...args) { originalHud(...args); sync(); };
  const originalAdvance = advance;
  advance = function(...args) {
    const done = originalAdvance(...args);
    if (done && args[0] === L) sync();
    return done;
  };
  const originalFinish = finishLevel;
  finishLevel = function(now) {
    const r = economy(); L.rewardEarned = 0;
    // Claude: günün bulmacası (L.daily, L.i null) ve ipucu alınan denemeler (L.hintUsed) jeton vermez
    // Claude: sezon etkinliği bölümleri (L.i null) bölüm jetonu vermez; ödülü etkinlik sonunda
    if (!L.daily && L.i !== null && !L.hintUsed && !L.powerUsed && starsFor(L.moves, L.par) === 3 && !r.claimed[L.i]) {
      r.claimed[L.i] = true; r.coins++; L.rewardEarned = 1 + grantWorldBonuses();
    }
    originalFinish(now);
    // Claude: günlük seri ödülü; seri 7, 14, 21… güne ulaştığı gün bir kez verilir (recordDaily seriyi originalFinish içinde günceller)
    const d = save.daily;
    if (L.daily && d && d.streak && d.streak % 7 === 0 && r.streakPaid !== d.date) {
      r.streakPaid = d.date; r.coins += STREAK_BONUS; L.rewardEarned = STREAK_BONUS; persist();
    }
    sync();
  };
  const originalWin = showWin;
  showWin = function(s) {
    originalWin(s);
    if (L.daily && L.rewardEarned) { $('winText').textContent += ` ${save.daily.streak} günlük seri: +${L.rewardEarned} jeton!`; return; }
    if (L.master && !L.rewardEarned) return; // Claude: usta kartında jeton yoksa jeton cümlesi de yok
    if (L.daily || L.hintUsed || L.event !== undefined) return; // Claude: bu denemelerde jeton yok, kartın kendi metni yeterli
    $('winText').textContent += L.powerUsed ? ' Güç kullanıldı: jeton verilmez.' : L.rewardEarned ? ` +${L.rewardEarned} özel jeton kazandın!` : s === 3 ? ' Bu bölümün jetonu daha önce alındı.' : ' İlk güçsüz 3 yıldızlı çözümün 1 jeton kazandırır.';
  };
  $('rewardOpen').onclick = openShop; titleButton.onclick = openShop;
  $('rewardClose').onclick = closeShop; $('rewardUse').onclick = usePower;
  shop.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeShop(); }
    if (e.key === 'Tab') {
      const buttons = [...shop.querySelectorAll('button:not(:disabled)')];
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    e.stopPropagation();
  });
  // Claude: harita sandıkları (index.html openChest) ödülünü buradan alır; ekonomi bu modülde kalsın diye.
  // skin: o dünyanın seti verilir, zaten alınmışsa yarı fiyatı jeton. Dönen liste pencerede gösterilir.
  window.grantReward = ({ w, coins = 0, power = 0, skin = false }) => {
    const r = economy(), got = [];
    if (skin && ITEMS[w] && !r.skins[w]) { r.skins[w] = true; got.push({ kind: 'skin', name: ITEMS[w].skin, color: ITEMS[w].color }); }
    else if (skin) coins += Math.round(SKIN_PRICE / 2);
    if (power && ITEMS[w]) { r.stock[w] = (r.stock[w] || 0) + power; got.push({ kind: 'power', name: ITEMS[w].power, n: power }); }
    if (coins) { r.coins += coins; got.unshift({ kind: 'coins', n: coins }); }
    persist(); sync();
    return got;
  };
  economy(); applyCollection(); sync();
})();
