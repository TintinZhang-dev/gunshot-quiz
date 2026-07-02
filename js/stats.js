// stats.js — Statistics & History Tracking
const STATS = (() => {
  const STORAGE_KEY = 'gunshot-quiz-stats';
  const DAILY_KEY = 'gunshot-quiz-daily';
  let containerEl = null;

  function getStats() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { history: [], confusedPairs: {} };
    } catch (e) {
      return { history: [], confusedPairs: {} };
    }
  }

  function saveStats(stats) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save stats:', e);
    }
  }

  function saveQuizResult(result) {
    const stats = getStats();
    stats.history.push(result);

    // Update confused pairs
    result.answers.forEach(a => {
      if (!a.isCorrect) {
        const pairKey = [a.correctGun.id, a.userGun.id].sort().join('|');
        if (!stats.confusedPairs[pairKey]) {
          stats.confusedPairs[pairKey] = {
            gunA: a.correctGun,
            gunB: a.userGun,
            count: 0
          };
        }
        stats.confusedPairs[pairKey].count++;
      }
    });

    // Keep last 100 records
    if (stats.history.length > 100) {
      stats.history = stats.history.slice(-100);
    }

    saveStats(stats);
  }

  async function init(container) {
    containerEl = container;
    render();
  }

  function render() {
    if (!containerEl) return;
    const t = I18N.t;
    const stats = getStats();

    containerEl.innerHTML = `
      <div class="stats-mode">
        <h2 class="section-title">${t('statsTitle')}</h2>

        <!-- Daily Challenge -->
        <div class="daily-challenge-card" id="daily-card"></div>

        <!-- Overall Stats -->
        <div class="stats-overview" id="stats-overview"></div>

        <!-- Confused Pairs -->
        <div class="confused-pairs-section" id="confused-pairs"></div>

        <!-- History -->
        <div class="history-section" id="history-section">
          <h3>${t('statsHistory')}</h3>
          <div class="history-list" id="history-list"></div>
        </div>

        <!-- Actions -->
        <div class="stats-actions">
          <button class="btn btn-outline btn-danger" id="btn-clear-stats">
            🗑 ${t('statsClearData')}
          </button>
          <button class="btn btn-outline" id="btn-export-stats">
            📥 ${t('statsExport')}
          </button>
        </div>
      </div>
    `;

    renderDailyChallenge();
    renderOverview();
    renderConfusedPairs();
    renderHistory();

    document.getElementById('btn-clear-stats').addEventListener('click', clearStats);
    document.getElementById('btn-export-stats').addEventListener('click', exportStats);
  }

  function renderDailyChallenge() {
    const card = document.getElementById('daily-card');
    if (!card) return;
    const t = I18N.t;

    const today = new Date().toISOString().split('T')[0];
    const dailyData = getDailyData();

    if (dailyData.date === today) {
      card.innerHTML = `
        <div class="daily-card completed">
          <h3>📅 ${t('dailyTitle')}</h3>
          <div class="daily-completed">${t('dailyCompleted')}</div>
          <div class="daily-result">
            <span class="daily-label">${t('dailyScore')}:</span>
            <span class="daily-score">${dailyData.score} / 5</span>
            <span class="daily-rate">(${dailyData.score * 20}%)</span>
          </div>
          <div class="daily-message">${t('dailyPlayAgain')}</div>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="daily-card available">
          <h3>📅 ${t('dailyTitle')}</h3>
          <p>${t('dailyDescription')}</p>
          <button class="btn btn-primary" id="btn-daily-challenge">
            🎯 ${t('statsDailyPlay')}
          </button>
        </div>
      `;
      document.getElementById('btn-daily-challenge')?.addEventListener('click', startDailyChallenge);
    }
  }

  function getDailyData() {
    try {
      const raw = localStorage.getItem(DAILY_KEY);
      return raw ? JSON.parse(raw) : { date: '', score: 0, answers: [] };
    } catch (e) {
      return { date: '', score: 0, answers: [] };
    }
  }

  function saveDailyData(data) {
    try {
      localStorage.setItem(DAILY_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save daily data:', e);
    }
  }

  async function startDailyChallenge() {
    const t = I18N.t;

    // Load guns data
    let guns = [];
    let sounds = {};
    try {
      const [gunsRes, soundsRes] = await Promise.all([
        fetch('data/guns.json'),
        fetch('data/sounds.json')
      ]);
      guns = (await gunsRes.json()).guns;
      sounds = (await soundsRes.json()).sounds;
    } catch (e) {
      console.error('Failed to load data:', e);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    // Seed random with date for consistent daily questions
    let seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);
    function dailyRandom() {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 0xffffffff;
    }

    const dailyGuns = [...guns].sort(() => dailyRandom() - 0.5).slice(0, 5);
    const questions = dailyGuns.map(gun => {
      const others = guns.filter(g => g.id !== gun.id);
      const sortedOthers = [...others].sort(() => dailyRandom() - 0.5);
      const wrongOptions = sortedOthers.slice(0, 3);
      const options = [...wrongOptions, gun].sort(() => dailyRandom() - 0.5);
      return {
        gun,
        options,
        correctIndex: options.findIndex(o => o.id === gun.id),
      };
    });

    let currentQ = 0;
    let dailyScore = 0;
    let currentAudio = null;
    let answered = false;

    function stopDailyAudio() {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
      }
    }

    function renderDailyQuestion() {
      if (currentQ >= 5) {
        stopDailyAudio();
        const data = { date: today, score: dailyScore, answers: [] };
        saveDailyData(data);
        // Also save in main stats
        saveQuizResult({
          playerName: 'Daily',
          score: dailyScore,
          total: 5,
          accuracy: dailyScore * 20,
          answers: [],
          date: new Date().toISOString(),
          mode: 'daily',
          rounds: 5,
          timerEnabled: false,
          timerSeconds: 0,
        });
        render();
        return;
      }

      answered = false;
      const q = questions[currentQ];

      containerEl.innerHTML = `
        <div class="quiz-round">
          <div class="quiz-header">
            <span class="progress-text">${t('dailyTitle')}: ${currentQ + 1} / 5</span>
            <span class="progress-text">${t('dailyScore')}: ${dailyScore}</span>
          </div>
          <div class="quiz-play-area">
            <div class="quiz-prompt">${t('quizListenPrompt')}</div>
            <button class="btn-play-large" id="btn-daily-play">
              <span class="play-icon">🔊</span>
            </button>
          </div>
          <div class="options-grid" id="daily-options">
            ${q.options.map((opt, i) => `
              <button class="option-btn" data-index="${i}">
                <span class="option-key">${i + 1}</span>
                <span class="option-text">${I18N.gunName(opt)}</span>
                <span class="option-platform">${opt.platform}</span>
              </button>
            `).join('')}
          </div>
          <div id="daily-feedback" style="display:none"></div>
          <button class="btn btn-primary" id="btn-daily-next" style="display:none">
            ${currentQ < 4 ? t('quizNext') + ' →' : '🏁 Finish'}
          </button>
        </div>
      `;

      document.getElementById('btn-daily-play').addEventListener('click', () => {
        stopDailyAudio();
        currentAudio = new Audio(sounds[q.gun.id]);
        currentAudio.volume = 0.8;
        currentAudio.play().catch(e => console.warn('Audio play failed:', e));
      });

      document.querySelectorAll('#daily-options .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          stopDailyAudio();

          const idx = parseInt(btn.dataset.index);
          const isCorrect = idx === q.correctIndex;
          if (isCorrect) dailyScore++;

          document.querySelectorAll('#daily-options .option-btn').forEach(b => b.disabled = true);
          btn.classList.add(isCorrect ? 'correct' : 'incorrect');
          document.querySelector(`#daily-options .option-btn[data-index="${q.correctIndex}"]`)
            ?.classList.add('correct');

          const fb = document.getElementById('daily-feedback');
          fb.style.display = 'block';
          fb.innerHTML = isCorrect ? t('quizCorrect') : `${t('quizIncorrect')} ${t('quizAnswer')} ${I18N.gunName(q.gun)}`;

          document.getElementById('btn-daily-next').style.display = 'block';
          document.getElementById('btn-daily-next').focus();
        });
      });

      document.getElementById('btn-daily-next').addEventListener('click', () => {
        currentQ++;
        stopDailyAudio();
        renderDailyQuestion();
      });

      // Auto-play
      setTimeout(() => {
        stopDailyAudio();
        currentAudio = new Audio(sounds[q.gun.id]);
        currentAudio.volume = 0.8;
        currentAudio.play().catch(() => {});
      }, 500);
    }

    renderDailyQuestion();
  }

  function renderOverview() {
    const el = document.getElementById('stats-overview');
    if (!el) return;
    const t = I18N.t;
    const stats = getStats();

    if (stats.history.length === 0) {
      el.innerHTML = `<div class="empty-state">${t('statsNoData')}</div>`;
      return;
    }

    const totalQuestions = stats.history.reduce((sum, h) => sum + h.total, 0);
    const totalCorrect = stats.history.reduce((sum, h) => sum + h.score, 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const totalGames = stats.history.length;

    // Player breakdown
    const playerStats = {};
    stats.history.forEach(h => {
      const name = h.playerName || 'Anonymous';
      if (!playerStats[name]) playerStats[name] = { games: 0, correct: 0, total: 0 };
      playerStats[name].games++;
      playerStats[name].correct += h.score;
      playerStats[name].total += h.total;
    });

    const topPlayers = Object.entries(playerStats)
      .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))
      .slice(0, 5);

    el.innerHTML = `
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">${totalGames}</div>
          <div class="stat-label">${t('statsHistory')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalCorrect} / ${totalQuestions}</div>
          <div class="stat-label">${t('statsScore')}</div>
        </div>
        <div class="stat-card highlight">
          <div class="stat-value">${accuracy}%</div>
          <div class="stat-label">${t('statsAccuracy')}</div>
        </div>
      </div>
      ${topPlayers.length > 1 ? `
        <div class="player-leaderboard">
          <h4>${t('statsPlayerStats')}</h4>
          <div class="leaderboard-list">
            ${topPlayers.map(([name, data], i) => `
              <div class="leaderboard-row">
                <span class="lb-rank">#${i + 1}</span>
                <span class="lb-name">${name}</span>
                <span class="lb-rate">${Math.round((data.correct / data.total) * 100)}%</span>
                <span class="lb-games">(${data.games} ${I18N.getLang() === 'zh' ? '局' : 'games'})</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  function renderConfusedPairs() {
    const el = document.getElementById('confused-pairs');
    if (!el) return;
    const t = I18N.t;
    const stats = getStats();

    const pairs = Object.values(stats.confusedPairs)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    if (pairs.length === 0) return;

    el.innerHTML = `
      <h3>⚠️ ${t('statsConfusedPairs')}</h3>
      <p class="confused-hint">${t('statsConfusedHint')}</p>
      <div class="confused-list">
        ${pairs.map(p => `
          <div class="confused-row">
            <span class="confused-count">${p.count}x</span>
            <span class="confused-guns">
              ${I18N.gunName(p.gunA)}
              <span class="confused-arrow">↔</span>
              ${I18N.gunName(p.gunB)}
            </span>
            <span class="confused-detail">
              (${p.gunA.platform} ↔ ${p.gunB.platform})
            </span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderHistory() {
    const el = document.getElementById('history-list');
    if (!el) return;
    const t = I18N.t;
    const stats = getStats();

    if (stats.history.length === 0) {
      el.innerHTML = `<div class="empty-state">${t('statsNoData')}</div>`;
      return;
    }

    const recent = [...stats.history].reverse().slice(0, 20);

    el.innerHTML = recent.map((h, i) => {
      const date = new Date(h.date);
      const dateStr = date.toLocaleDateString(I18N.getLang() === 'zh' ? 'zh-CN' : 'en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const modeLabel = h.mode === 'daily' ? '📅 Daily' : '🎯 Quiz';

      return `
        <div class="history-item">
          <span class="history-date">${dateStr}</span>
          <span class="history-mode">${modeLabel}</span>
          <span class="history-player">${h.playerName || '—'}</span>
          <span class="history-score">${h.score}/${h.total}</span>
          <span class="history-rate ${h.accuracy >= 80 ? 'rate-good' : h.accuracy >= 50 ? 'rate-ok' : 'rate-bad'}">
            ${h.accuracy}%
          </span>
        </div>
      `;
    }).join('');
  }

  function clearStats() {
    if (confirm(I18N.t('statsClearConfirm'))) {
      localStorage.removeItem(STORAGE_KEY);
      render();
    }
  }

  function exportStats() {
    const stats = getStats();
    const t = I18N.t;
    let csv = 'Date,Player,Mode,Score,Total,Accuracy\n';
    stats.history.forEach(h => {
      csv += `${h.date},${h.playerName},${h.mode},${h.score},${h.total},${h.accuracy}%\n`;
    });

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gunshot-quiz-stats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function destroy() {}

  return { init, saveQuizResult, destroy };
})();
