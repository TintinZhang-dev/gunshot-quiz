// app.js — Main Application Shell
const APP = (() => {
  let currentTab = 'quiz';
  const modules = { quiz: QUIZ, compare: COMPARE, learn: LEARN, stats: STATS };
  const contentEl = document.getElementById('app-content');
  const navTabs = document.querySelectorAll('.nav-tab');
  const langBtns = document.querySelectorAll('.lang-btn');

  function init() {
    // Set initial language based on localStorage or browser preference
    const savedLang = localStorage.getItem('gunshot-quiz-lang');
    if (savedLang) {
      I18N.setLang(savedLang);
    } else {
      const browserLang = navigator.language || 'en';
      I18N.setLang(browserLang.startsWith('zh') ? 'zh' : 'en');
    }
    updateLangButtons();
    updateUIText();

    // Navigation
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        navigate(target);
      });
    });

    // Language switcher
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        I18N.setLang(lang);
        localStorage.setItem('gunshot-quiz-lang', lang);
        updateLangButtons();
        updateUIText();
        navigate(currentTab); // re-render with new language
      });
    });

    // Global keyboard handler
    document.addEventListener('keydown', (e) => {
      if (currentTab === 'quiz') {
        QUIZ.handleKeydown(e);
      }
    });

    // Check for daily challenge on stats tab
    // Start on quiz tab
    navigate('quiz');

    // Handle window resize for mobile
    window.addEventListener('resize', handleResize);
    handleResize();
  }

  function navigate(tab) {
    currentTab = tab;

    // Cleanup current module
    Object.values(modules).forEach(m => {
      if (m.destroy) m.destroy();
    });

    // Update active tab
    navTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });

    // Render module
    const module = modules[tab];
    if (module && module.init) {
      module.init(contentEl);
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }

  function updateLangButtons() {
    const current = I18N.getLang();
    langBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === current);
    });
  }

  function updateUIText() {
    const t = I18N.t;

    // App title
    const titleEl = document.querySelector('.app-title');
    if (titleEl) titleEl.textContent = t('appTitle');

    const subtitleEl = document.querySelector('.app-subtitle');
    if (subtitleEl) subtitleEl.textContent = t('appSubtitle');

    // Nav tabs
    const tabLabels = {
      quiz: t('tabQuiz'),
      compare: t('tabCompare'),
      learn: t('tabLearn'),
      stats: t('tabStats'),
    };
    navTabs.forEach(tab => {
      const key = tab.dataset.tab;
      if (tabLabels[key]) tab.textContent = tabLabels[key];
    });

    // Footer
    const footerEl = document.querySelector('.app-footer');
    if (footerEl) footerEl.textContent = t('footerNote');
  }

  function handleResize() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  return { navigate, init };
})();

// Boot the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  APP.init();
});
