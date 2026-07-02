// learn.js — Learning Mode
const LEARN = (() => {
  let guns = [];
  let sounds = {};
  let currentFilter = 'all';
  let currentAudio = null;
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

    const categories = [
      { key: 'all', label: t('learnFilterAll') },
      { key: 'pistol', label: t('learnFilterPistol') },
      { key: 'rifle', label: t('learnFilterRifle') },
      { key: 'smg', label: t('learnFilterSmg') },
      { key: 'shotgun', label: t('learnFilterShotgun') },
      { key: 'special', label: t('learnFilterSpecial') },
    ];

    containerEl.innerHTML = `
      <div class="learn-mode">
        <h2 class="section-title">${t('learnTitle')}</h2>

        <div class="category-filter">
          ${categories.map(cat => `
            <button class="btn btn-outline cat-btn ${cat.key === currentFilter ? 'active' : ''}"
                    data-cat="${cat.key}">
              ${cat.label}
            </button>
          `).join('')}
        </div>

        <div class="learn-grid" id="learn-grid">
          ${renderGunCards()}
        </div>
      </div>
    `;

    // Category filter events
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.cat;
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        refreshGrid();
      });
    });

    // Play button events
    document.querySelectorAll('.learn-play-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const gunId = btn.dataset.gunId;
        playGunSound(gunId, btn);
      });
    });
  }

  function renderGunCards() {
    const filtered = currentFilter === 'all'
      ? guns
      : guns.filter(g => g.category === currentFilter);

    if (filtered.length === 0) {
      return `<div class="empty-state">No guns found in this category.</div>`;
    }

    return filtered.map(gun => `
      <div class="gun-learn-card" id="card-${gun.id}">
        <div class="gun-learn-header">
          <div class="gun-learn-name">${I18N.gunName(gun)}</div>
          <div class="gun-learn-badges">
            <span class="badge badge-cat">${I18N.catName(gun.category)}</span>
            <span class="badge badge-platform">${gun.platform}</span>
          </div>
        </div>
        <div class="gun-learn-body">
          <div class="gun-learn-desc">${I18N.gunDesc(gun)}</div>
        </div>
        <div class="gun-learn-footer">
          <button class="btn btn-play-compare learn-play-btn" data-gun-id="${gun.id}">
            🔊 ${I18N.t('learnPlay')}
          </button>
          <div class="sound-wave learn-wave" id="wave-${gun.id}" style="display:none">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function refreshGrid() {
    const gridEl = document.getElementById('learn-grid');
    if (!gridEl) return;
    gridEl.innerHTML = renderGunCards();

    // Re-attach events
    gridEl.querySelectorAll('.learn-play-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const gunId = btn.dataset.gunId;
        playGunSound(gunId, btn);
      });
    });
  }

  function playGunSound(gunId, btn) {
    stopAudio();

    const soundUrl = sounds[gunId];
    if (!soundUrl) {
      alert(I18N.t('quizNoSound'));
      return;
    }

    const waveEl = document.getElementById(`wave-${gunId}`);
    if (waveEl) waveEl.style.display = 'flex';
    if (btn) {
      btn.textContent = '⏹ ' + I18N.t('compareStop');
      btn.classList.add('playing');
    }

    currentAudio = new Audio(soundUrl);
    currentAudio.volume = 0.8;
    currentAudio.play().catch(e => console.warn('Audio play failed:', e));

    currentAudio.addEventListener('ended', () => {
      if (waveEl) waveEl.style.display = 'none';
      if (btn) {
        btn.textContent = '🔊 ' + I18N.t('learnPlay');
        btn.classList.remove('playing');
      }
      currentAudio = null;
    });

    currentAudio.addEventListener('error', () => {
      if (waveEl) waveEl.style.display = 'none';
      if (btn) {
        btn.textContent = '🔊 ' + I18N.t('learnPlay');
        btn.classList.remove('playing');
      }
      currentAudio = null;
    });
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    // Reset all buttons
    document.querySelectorAll('.learn-play-btn.playing').forEach(btn => {
      btn.textContent = '🔊 ' + I18N.t('learnPlay');
      btn.classList.remove('playing');
    });
    document.querySelectorAll('.learn-wave').forEach(w => w.style.display = 'none');
  }

  function destroy() {
    stopAudio();
  }

  return { init, destroy };
})();
