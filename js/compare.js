// compare.js — A/B Comparison Mode
const COMPARE = (() => {
  let guns = [];
  let sounds = {};
  let gunA = null;
  let gunB = null;
  let audioA = null;
  let audioB = null;
  let containerEl = null;

  async function init(container) {
    containerEl = container;
    await loadData();
    render();
  }

  async function loadData() {
    try {
      const [gunsRes, soundsRes] = await Promise.all([
        fetch('data/guns.json'),
        fetch('data/sounds.json')
      ]);
      guns = (await gunsRes.json()).guns;
      sounds = (await soundsRes.json()).sounds;
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  }

  function render() {
    if (!containerEl) return;
    const t = I18N.t;

    const gunOptions = guns.map(g => `
      <option value="${g.id}">${I18N.gunName(g)} (${g.platform})</option>
    `).join('');

    containerEl.innerHTML = `
      <div class="compare-mode">
        <h2 class="section-title">${t('compareTitle')}</h2>
        <p class="compare-tip">${t('compareTip')}</p>

        <div class="compare-container">
          <div class="compare-side compare-side-a">
            <div class="compare-label">A</div>
            <div class="form-group">
              <label>${t('compareSelectA')}</label>
              <select class="input-field compare-select" id="select-gun-a">
                <option value="">-- ${t('compareSelectA')} --</option>
                ${gunOptions}
              </select>
            </div>
            <div class="compare-info" id="compare-info-a"></div>
            <button class="btn btn-play-compare" id="btn-play-a" disabled>
              🔊 ${t('comparePlayA')}
            </button>
            <div class="sound-wave compare-wave" id="wave-a" style="display:none">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>

          <div class="compare-divider">
            <span>VS</span>
            <button class="btn btn-sm btn-outline" id="btn-swap" title="${t('compareSwap')}">${t('compareSwap')}</button>
          </div>

          <div class="compare-side compare-side-b">
            <div class="compare-label">B</div>
            <div class="form-group">
              <label>${t('compareSelectB')}</label>
              <select class="input-field compare-select" id="select-gun-b">
                <option value="">-- ${t('compareSelectB')} --</option>
                ${gunOptions}
              </select>
            </div>
            <div class="compare-info" id="compare-info-b"></div>
            <button class="btn btn-play-compare" id="btn-play-b" disabled>
              🔊 ${t('comparePlayB')}
            </button>
            <div class="sound-wave compare-wave" id="wave-b" style="display:none">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <div class="compare-analysis" id="compare-analysis" style="display:none">
          <h3>📊 ${t('learnSoundFeatures')}</h3>
          <div class="compare-features" id="compare-features"></div>
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById('select-gun-a').addEventListener('change', (e) => {
      gunA = guns.find(g => g.id === e.target.value) || null;
      updateGunInfo('a');
      document.getElementById('btn-play-a').disabled = !gunA;
      updateComparison();
    });

    document.getElementById('select-gun-b').addEventListener('change', (e) => {
      gunB = guns.find(g => g.id === e.target.value) || null;
      updateGunInfo('b');
      document.getElementById('btn-play-b').disabled = !gunB;
      updateComparison();
    });

    document.getElementById('btn-play-a').addEventListener('click', () => togglePlay('a'));
    document.getElementById('btn-play-b').addEventListener('click', () => togglePlay('b'));
    document.getElementById('btn-swap').addEventListener('click', swapGuns);
  }

  function updateGunInfo(side) {
    const gun = side === 'a' ? gunA : gunB;
    const infoEl = document.getElementById(`compare-info-${side}`);
    if (!infoEl) return;

    if (gun) {
      infoEl.innerHTML = `
        <div class="gun-card-mini">
          <div class="gun-card-name">${I18N.gunName(gun)}</div>
          <div class="gun-card-platform">${gun.platform}</div>
          <div class="gun-card-cat">${I18N.catName(gun.category)}</div>
        </div>
      `;
    } else {
      infoEl.innerHTML = '';
    }
  }

  function updateComparison() {
    const analysisEl = document.getElementById('compare-analysis');
    const featuresEl = document.getElementById('compare-features');
    if (!analysisEl || !featuresEl) return;

    if (gunA && gunB) {
      analysisEl.style.display = 'block';
      featuresEl.innerHTML = `
        <div class="feature-row">
          <div class="feature-gun">
            <strong>${I18N.gunName(gunA)}</strong>
            <span class="feature-cat">${I18N.catName(gunA.category)}</span>
          </div>
          <div class="feature-vs">VS</div>
          <div class="feature-gun">
            <strong>${I18N.gunName(gunB)}</strong>
            <span class="feature-cat">${I18N.catName(gunB.category)}</span>
          </div>
        </div>
        <div class="feature-row">
          <div class="feature-desc">${I18N.gunDesc(gunA)}</div>
          <div class="feature-desc">${I18N.gunDesc(gunB)}</div>
        </div>
      `;
    } else {
      analysisEl.style.display = 'none';
    }
  }

  function togglePlay(side) {
    const gun = side === 'a' ? gunA : gunB;
    const audioRef = side === 'a' ? 'audioA' : 'audioB';
    const waveId = `wave-${side}`;
    const btnId = `btn-play-${side}`;

    // Stop if already playing
    if (side === 'a' && audioA) {
      stopSide('a');
      return;
    }
    if (side === 'b' && audioB) {
      stopSide('b');
      return;
    }

    // Stop the other side
    stopSide(side === 'a' ? 'b' : 'a');

    const soundUrl = sounds[gun.id];
    if (!soundUrl) {
      alert(I18N.t('quizNoSound'));
      return;
    }

    const audio = new Audio(soundUrl);
    audio.volume = 0.8;

    if (side === 'a') audioA = audio;
    else audioB = audio;

    const waveEl = document.getElementById(waveId);
    const btnEl = document.getElementById(btnId);

    if (waveEl) waveEl.style.display = 'flex';
    if (btnEl) {
      btnEl.textContent = '⏹ ' + I18N.t('compareStop');
      btnEl.classList.add('playing');
    }

    audio.play().catch(e => console.warn('Audio play failed:', e));

    audio.addEventListener('ended', () => {
      resetSide(side);
    });

    audio.addEventListener('error', () => {
      resetSide(side);
    });
  }

  function stopSide(side) {
    const audio = side === 'a' ? audioA : audioB;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      if (side === 'a') audioA = null;
      else audioB = null;
    }
    resetSide(side);
  }

  function resetSide(side) {
    const waveEl = document.getElementById(`wave-${side}`);
    const btnEl = document.getElementById(`btn-play-${side}`);
    const t = I18N.t;

    if (waveEl) waveEl.style.display = 'none';
    if (btnEl) {
      btnEl.textContent = '🔊 ' + (side === 'a' ? t('comparePlayA') : t('comparePlayB'));
      btnEl.classList.remove('playing');
    }
  }

  function swapGuns() {
    const selectA = document.getElementById('select-gun-a');
    const selectB = document.getElementById('select-gun-b');

    const tmpVal = selectA.value;
    selectA.value = selectB.value;
    selectB.value = tmpVal;

    gunA = guns.find(g => g.id === selectA.value) || null;
    gunB = guns.find(g => g.id === selectB.value) || null;

    updateGunInfo('a');
    updateGunInfo('b');
    updateComparison();

    document.getElementById('btn-play-a').disabled = !gunA;
    document.getElementById('btn-play-b').disabled = !gunB;
  }

  function destroy() {
    stopSide('a');
    stopSide('b');
  }

  return { init, destroy };
})();
