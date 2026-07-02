// quiz.js — Blind Quiz Mode
const QUIZ = (() => {
  let guns = [];
  let sounds = {};
  let currentRound = 0;
  let totalRounds = 10;
  let score = 0;
  let timerEnabled = true;
  let timerSeconds = 60;
  let timerInterval = null;
  let timeRemaining = 0;
  let quizQuestions = [];
  let answers = []; // { questionId, correct, userAnswer, timeTaken }
  let playerName = '';
  let quizActive = false;
  let currentAudio = null;
  let answered = false;

  // DOM refs
  let containerEl = null;

  async function init(container) {
    containerEl = container;
    await loadData();
    renderSetup();
  }

  async function loadData() {
    try {
      const [gunsRes, soundsRes] = await Promise.all([
        fetch('data/guns.json'),
        fetch('data/sounds.json')
      ]);
      const gunsData = await gunsRes.json();
      guns = gunsData.guns;
      const soundsData = await soundsRes.json();
      sounds = soundsData.sounds;
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  }

  function renderSetup() {
    if (!containerEl) return;
    const t = I18N.t;

    containerEl.innerHTML = `
      <div class="quiz-setup">
        <h2 class="section-title">${t('quizTitle')}</h2>

        <div class="setup-form">
          <div class="form-group">
            <label>${t('quizPlayerName')}</label>
            <input type="text" id="quiz-player-name" class="input-field"
                   placeholder="${t('quizPlayerPlaceholder')}" maxlength="20"
                   value="${playerName}">
          </div>

          <div class="form-group">
            <label>${t('quizRounds')}</label>
            <div class="btn-group" id="rounds-select">
              <button class="btn btn-outline active" data-rounds="10">${t('quizRounds10')}</button>
              <button class="btn btn-outline" data-rounds="20">${t('quizRounds20')}</button>
              <button class="btn btn-outline" data-rounds="${guns.length}">${t('quizRoundsAll', { count: guns.length })}</button>
            </div>
          </div>

          <div class="form-group">
            <label>${t('quizTimer')}</label>
            <div class="btn-group" id="timer-select">
              <button class="btn btn-outline active" data-timer="on">${t('quizTimerOn')}</button>
              <button class="btn btn-outline" data-timer="off">${t('quizTimerOff')}</button>
            </div>
          </div>

          <div class="form-group" id="timer-seconds-group">
            <label>${t('settingsTimer')}</label>
            <input type="number" id="timer-seconds" class="input-field"
                   value="${timerSeconds}" min="10" max="120" step="5">
          </div>

          <button class="btn btn-primary btn-large" id="btn-start-quiz">
            🎯 ${t('quizStart')}
          </button>

          <p class="keyboard-hint">${t('quizKeyboard')}</p>
        </div>
      </div>
    `;

    // Event listeners
    document.querySelectorAll('#rounds-select button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#rounds-select button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        totalRounds = parseInt(btn.dataset.rounds);
      });
    });

    document.querySelectorAll('#timer-select button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#timer-select button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        timerEnabled = btn.dataset.timer === 'on';
        const tsGroup = document.getElementById('timer-seconds-group');
        if (tsGroup) tsGroup.style.display = timerEnabled ? 'block' : 'none';
      });
    });

    document.getElementById('btn-start-quiz').addEventListener('click', startQuiz);
    document.getElementById('quiz-player-name').addEventListener('input', (e) => {
      playerName = e.target.value.trim();
    });

    const tsGroup = document.getElementById('timer-seconds-group');
    if (tsGroup) tsGroup.style.display = timerEnabled ? 'block' : 'none';
  }

  function generateQuestions() {
    const shuffled = [...guns].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, totalRounds);

    return selected.map(gun => {
      // Pick 3 wrong options + 1 correct
      const others = guns.filter(g => g.id !== gun.id);
      const wrongOptions = others.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...wrongOptions, gun].sort(() => Math.random() - 0.5);

      return {
        gun,
        options,
        correctIndex: options.findIndex(o => o.id === gun.id),
      };
    });
  }

  function startQuiz() {
    playerName = document.getElementById('quiz-player-name')?.value?.trim() || 'Anonymous';
    timerSeconds = parseInt(document.getElementById('timer-seconds')?.value) || 60;

    currentRound = 0;
    score = 0;
    answers = [];
    quizQuestions = generateQuestions();
    quizActive = true;
    answered = false;

    renderQuizRound();
  }

  function renderQuizRound() {
    if (!containerEl || currentRound >= totalRounds) {
      finishQuiz();
      return;
    }

    const t = I18N.t;
    const question = quizQuestions[currentRound];
    const gun = question.gun;

    stopAudio();
    stopTimer();
    answered = false;
    timeRemaining = timerSeconds;

    containerEl.innerHTML = `
      <div class="quiz-round">
        <div class="quiz-header">
          <div class="quiz-progress">
            <span class="progress-text">${t('statsCurrentRound')}: ${currentRound + 1} / ${totalRounds}</span>
            <span class="progress-text">${t('quizScore')}: ${score}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(currentRound / totalRounds) * 100}%"></div>
          </div>
          ${timerEnabled ? `<div class="quiz-timer" id="quiz-timer">⏱ ${timeRemaining}s</div>` : ''}
        </div>

        <div class="quiz-play-area">
          <div class="quiz-prompt">${t('quizListenPrompt')}</div>
          <button class="btn-play-large" id="btn-play-sound" title="${t('quizPlayAgain')}">
            <span class="play-icon">🔊</span>
            <span class="play-ring"></span>
          </button>
          <div class="quiz-listening" id="quiz-listening" style="display:none">
            <div class="sound-wave">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <span>${t('quizListening')}</span>
          </div>
          <div id="quiz-sound-error" class="quiz-error" style="display:none">${t('quizNoSound')}</div>
        </div>

        <div class="quiz-options">
          <div class="quiz-options-title">${t('quizSelectAnswer')}</div>
          <div class="options-grid" id="options-grid">
            ${question.options.map((opt, i) => `
              <button class="option-btn" data-index="${i}" id="option-${i}">
                <span class="option-key">${i + 1}</span>
                <span class="option-text">${I18N.gunName(opt)}</span>
                <span class="option-platform">${opt.platform}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div id="quiz-feedback" class="quiz-feedback" style="display:none"></div>
        <button class="btn btn-primary" id="btn-next" style="display:none">${t('quizNext')} →</button>
      </div>
    `;

    // Event listeners
    document.getElementById('btn-play-sound').addEventListener('click', () => playGunSound(gun.id));

    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        const index = parseInt(btn.dataset.index);
        selectAnswer(index);
      });
    });

    document.getElementById('btn-next').addEventListener('click', nextRound);

    // Auto-play
    setTimeout(() => playGunSound(gun.id), 500);

    // Start timer
    if (timerEnabled) startTimer();
  }

  function selectAnswer(index) {
    if (answered) return;
    answered = true;
    stopTimer();

    const question = quizQuestions[currentRound];
    const t = I18N.t;
    const isCorrect = index === question.correctIndex;
    const timeTaken = timerSeconds - timeRemaining;

    if (isCorrect) score++;

    answers.push({
      questionId: question.gun.id,
      correctGun: question.gun,
      userGun: question.options[index],
      isCorrect,
      timeTaken,
    });

    // Visual feedback
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

    const selectedBtn = document.getElementById(`option-${index}`);
    const correctBtn = document.getElementById(`option-${question.correctIndex}`);

    if (isCorrect) {
      selectedBtn.classList.add('correct');
    } else {
      selectedBtn.classList.add('incorrect');
      correctBtn.classList.add('correct');
    }

    // Show feedback
    const feedbackEl = document.getElementById('quiz-feedback');
    feedbackEl.style.display = 'block';
    feedbackEl.className = `quiz-feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;
    feedbackEl.innerHTML = `
      <div class="feedback-icon">${isCorrect ? t('quizCorrect') : t('quizIncorrect')}</div>
      ${isCorrect ? '' : `<div class="feedback-answer">${t('quizAnswer')} <strong>${I18N.gunName(question.gun)}</strong> (${question.gun.platform})</div>`}
    `;

    document.getElementById('btn-next').style.display = 'block';
    document.getElementById('btn-next').focus();
  }

  function nextRound() {
    currentRound++;
    if (currentRound >= totalRounds) {
      finishQuiz();
    } else {
      renderQuizRound();
    }
  }

  function finishQuiz() {
    quizActive = false;
    stopAudio();
    stopTimer();

    const t = I18N.t;
    const accuracy = totalRounds > 0 ? Math.round((score / totalRounds) * 100) : 0;

    // Save stats
    STATS.saveQuizResult({
      playerName,
      score,
      total: totalRounds,
      accuracy,
      answers,
      date: new Date().toISOString(),
      mode: 'quiz',
      rounds: totalRounds,
      timerEnabled,
      timerSeconds,
    });

    let stars = '';
    if (accuracy >= 90) stars = '⭐⭐⭐';
    else if (accuracy >= 70) stars = '⭐⭐';
    else if (accuracy >= 50) stars = '⭐';
    else stars = '💪';

    containerEl.innerHTML = `
      <div class="quiz-result">
        <h2 class="section-title">${t('statsTitle')}</h2>

        <div class="result-card">
          <div class="result-stars">${stars}</div>
          <div class="result-score">
            <span class="score-number">${score}</span>
            <span class="score-divider">/</span>
            <span class="score-total">${totalRounds}</span>
          </div>
          <div class="result-accuracy">
            <div class="accuracy-circle" style="--percent: ${accuracy}">
              <span>${accuracy}%</span>
            </div>
          </div>
          <div class="result-player">${playerName}</div>
        </div>

        <div class="result-detail" id="result-detail"></div>

        <div class="result-actions">
          <button class="btn btn-primary" id="btn-restart">${t('btnRestart')}</button>
          <button class="btn btn-outline" id="btn-review">${t('statsHistory')}</button>
        </div>
      </div>
    `;

    document.getElementById('btn-restart').addEventListener('click', () => renderSetup());
    document.getElementById('btn-review').addEventListener('click', () => {
      APP.navigate('stats');
    });

    // Render detail breakdown
    renderAnswerBreakdown();
  }

  function renderAnswerBreakdown() {
    const detailEl = document.getElementById('result-detail');
    if (!detailEl) return;
    const t = I18N.t;

    detailEl.innerHTML = `
      <h3>${t('statsHistory')}</h3>
      <div class="answer-list">
        ${answers.map((a, i) => `
          <div class="answer-item ${a.isCorrect ? 'answer-correct' : 'answer-wrong'}">
            <span class="answer-num">#${i + 1}</span>
            <span class="answer-icon">${a.isCorrect ? '✅' : '❌'}</span>
            <span class="answer-correct-gun">${I18N.gunName(a.correctGun)}</span>
            ${!a.isCorrect ? `<span class="answer-user-gun">→ ${I18N.gunName(a.userGun)}</span>` : ''}
            <span class="answer-time">${a.timeTaken}s</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function playGunSound(gunId) {
    stopAudio();

    const soundUrl = sounds[gunId];
    if (!soundUrl) {
      const errEl = document.getElementById('quiz-sound-error');
      if (errEl) errEl.style.display = 'block';
      return;
    }

    const listeningEl = document.getElementById('quiz-listening');
    const playBtn = document.getElementById('btn-play-sound');

    if (listeningEl) listeningEl.style.display = 'flex';
    if (playBtn) playBtn.style.opacity = '0.6';

    currentAudio = new Audio(soundUrl);
    currentAudio.volume = 0.8;
    currentAudio.play().catch(e => {
      console.warn('Audio play failed:', e);
      const errEl = document.getElementById('quiz-sound-error');
      if (errEl) errEl.style.display = 'block';
    });

    currentAudio.addEventListener('ended', () => {
      if (listeningEl) listeningEl.style.display = 'none';
      if (playBtn) playBtn.style.opacity = '1';
    });

    currentAudio.addEventListener('error', () => {
      if (listeningEl) listeningEl.style.display = 'none';
      if (playBtn) playBtn.style.opacity = '1';
      const errEl = document.getElementById('quiz-sound-error');
      if (errEl) errEl.style.display = 'block';
    });
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  function startTimer() {
    stopTimer();
    timeRemaining = timerSeconds;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();

      if (timeRemaining <= 0) {
        stopTimer();
        if (!answered) {
          // Time's up — pick random answer
          const question = quizQuestions[currentRound];
          const randomIndex = Math.floor(Math.random() * 4);
          selectAnswer(randomIndex);
        }
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    const timerEl = document.getElementById('quiz-timer');
    if (timerEl) {
      timerEl.textContent = `⏱ ${timeRemaining}s`;
      if (timeRemaining <= 10) timerEl.classList.add('timer-warning');
      else timerEl.classList.remove('timer-warning');
    }
  }

  // Keyboard handler
  function handleKeydown(e) {
    if (!quizActive || answered) return;

    if (e.code === 'Space') {
      e.preventDefault();
      const question = quizQuestions[currentRound];
      if (question) playGunSound(question.gun.id);
    } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'].includes(e.code)) {
      e.preventDefault();
      const index = parseInt(e.code.replace('Digit', '').replace('Numpad', '')) - 1;
      if (index >= 0 && index < 4) selectAnswer(index);
    } else if (e.code === 'Enter' && answered) {
      e.preventDefault();
      nextRound();
    }
  }

  // Cleanup
  function destroy() {
    stopAudio();
    stopTimer();
    quizActive = false;
  }

  return { init, handleKeydown, destroy };
})();
