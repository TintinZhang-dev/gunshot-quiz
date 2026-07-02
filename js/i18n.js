// i18n.js — Internationalization module for Gunshot Quiz
const I18N = (() => {
  let currentLang = 'zh';

  const translations = {
    zh: {
      // App shell
      appTitle: '枪声盲听训练',
      appSubtitle: '训练耳朵辨别不同枪型',

      // Navigation tabs
      tabQuiz: '盲听猜枪',
      tabCompare: 'A/B 对比',
      tabLearn: '学习模式',
      tabStats: '成绩统计',

      // Quiz mode
      quizTitle: '盲听猜枪模式',
      quizListenPrompt: '仔细听这段枪声...',
      quizSelectAnswer: '选择你认为正确的枪型：',
      quizPlayAgain: '再听一次',
      quizCorrect: '✅ 正确！',
      quizIncorrect: '❌ 错误！',
      quizAnswer: '正确答案：',
      quizYourAnswer: '你的选择：',
      quizNext: '下一题',
      quizListening: '正在播放...',
      quizTimeLeft: '剩余时间',
      quizTimeUp: '时间到！',
      quizNoSound: '⚠️ 声音文件未找到，请检查音源配置',
      quizRounds: '题目数量',
      quizRounds10: '10 题',
      quizRounds20: '20 题',
      quizRoundsAll: '全部 ({count} 题)',
      quizStart: '开始答题',
      quizTimer: '计时器',
      quizTimerOn: '开启',
      quizTimerOff: '关闭',
      quizKeyboard: '💡 键盘快捷键：空格 = 播放，1-4 = 选择答案',
      quizPlayerName: '玩家名称',
      quizPlayerPlaceholder: '输入你的名字...',
      quizScore: '得分',

      // Compare mode
      compareTitle: 'A/B 对比模式',
      compareSelectA: '选择枪型 A',
      compareSelectB: '选择枪型 B',
      comparePlayA: '播放 A',
      comparePlayB: '播放 B',
      compareStop: '停止',
      compareSwap: '⇄ 交换',
      compareTip: '💡 提示：反复切换播放两种枪声，仔细对比音色、音高和节奏的差异',

      // Learn mode
      learnTitle: '学习模式',
      learnFilterAll: '全部',
      learnFilterPistol: '手枪',
      learnFilterRifle: '步枪',
      learnFilterSmg: '冲锋枪',
      learnFilterShotgun: '霰弹枪',
      learnFilterSpecial: '特殊',
      learnPlay: '播放声音',
      learnSoundFeatures: '声音特征',
      learnPlatform: '搭载平台',
      learnCategory: '分类',

      // Stats
      statsTitle: '成绩统计',
      statsCurrentRound: '当前轮次',
      statsScore: '得分',
      statsTotalQuestions: '总题数',
      statsAccuracy: '正确率',
      statsConfusedPairs: '容易混淆的配对',
      statsConfusedHint: '（你最容易搞错的枪型组合）',
      statsNoData: '还没有答题记录，去玩几轮吧！',
      statsClearData: '清除记录',
      statsClearConfirm: '确定要清除所有成绩记录吗？',
      statsPlayerStats: '玩家统计',
      statsHistory: '历史记录',
      statsDate: '日期',
      statsMode: '模式',
      statsCorrect: '正确',
      statsWrong: '错误',
      statsRate: '正确率',
      statsExport: '导出成绩',
      statsDaily: '每日挑战',
      statsDailyBest: '今日最佳',
      statsDailyPlay: '开始每日挑战',

      // Daily challenge
      dailyTitle: '每日挑战',
      dailyDescription: '5 道随机题目，看看你今天能拿几分！',
      dailyCompleted: '今日已完成！',
      dailyScore: '今日得分',
      dailyPlayAgain: '明天再来',

      // General
      btnStart: '开始',
      btnRestart: '重新开始',
      btnBack: '返回',
      btnExport: '导出',
      langSwitch: 'English',
      langLabel: '语言',

      // Categories
      catPistol: '手枪',
      catRifle: '步枪',
      catSmg: '冲锋枪/PCC',
      catShotgun: '霰弹枪',
      catSpecial: '特殊',

      // Footer
      footerNote: '⚠️ 音源来自网络公开资源，仅供学习训练使用。请支持正版。',

      // Settings
      settingsTitle: '设置',
      settingsTimer: '答题限时（秒）',
      settingsVolume: '音量',
    },

    en: {
      // App shell
      appTitle: 'Gunshot Blind Quiz',
      appSubtitle: 'Train Your Ear to Identify Firearms',

      // Navigation tabs
      tabQuiz: 'Blind Quiz',
      tabCompare: 'A/B Compare',
      tabLearn: 'Learn',
      tabStats: 'Statistics',

      // Quiz mode
      quizTitle: 'Blind Quiz Mode',
      quizListenPrompt: 'Listen carefully to this gunshot...',
      quizSelectAnswer: 'Which firearm is this?',
      quizPlayAgain: 'Play Again',
      quizCorrect: '✅ Correct!',
      quizIncorrect: '❌ Wrong!',
      quizAnswer: 'Answer: ',
      quizYourAnswer: 'Your choice: ',
      quizNext: 'Next',
      quizListening: 'Playing...',
      quizTimeLeft: 'Time left',
      quizTimeUp: "Time's up!",
      quizNoSound: '⚠️ Sound file not found. Please check audio configuration.',
      quizRounds: 'Number of Questions',
      quizRounds10: '10 Rounds',
      quizRounds20: '20 Rounds',
      quizRoundsAll: 'All ({count} rounds)',
      quizStart: 'Start Quiz',
      quizTimer: 'Timer',
      quizTimerOn: 'On',
      quizTimerOff: 'Off',
      quizKeyboard: '💡 Shortcuts: Space = Play, 1-4 = Select Answer',
      quizPlayerName: 'Player Name',
      quizPlayerPlaceholder: 'Enter your name...',
      quizScore: 'Score',

      // Compare mode
      compareTitle: 'A/B Comparison Mode',
      compareSelectA: 'Select Gun A',
      compareSelectB: 'Select Gun B',
      comparePlayA: 'Play A',
      comparePlayB: 'Play B',
      compareStop: 'Stop',
      compareSwap: '⇄ Swap',
      compareTip: '💡 Tip: Switch back and forth between the two gunshots to compare tone, pitch, and rhythm',

      // Learn mode
      learnTitle: 'Learning Mode',
      learnFilterAll: 'All',
      learnFilterPistol: 'Pistol',
      learnFilterRifle: 'Rifle',
      learnFilterSmg: 'SMG',
      learnFilterShotgun: 'Shotgun',
      learnFilterSpecial: 'Special',
      learnPlay: 'Play Sound',
      learnSoundFeatures: 'Sound Characteristics',
      learnPlatform: 'Platform',
      learnCategory: 'Category',

      // Stats
      statsTitle: 'Statistics',
      statsCurrentRound: 'Current Round',
      statsScore: 'Score',
      statsTotalQuestions: 'Total Questions',
      statsAccuracy: 'Accuracy',
      statsConfusedPairs: 'Confused Pairs',
      statsConfusedHint: '(Pairs you most often mix up)',
      statsNoData: 'No data yet. Go play some rounds!',
      statsClearData: 'Clear Records',
      statsClearConfirm: 'Are you sure you want to clear all records?',
      statsPlayerStats: 'Player Statistics',
      statsHistory: 'History',
      statsDate: 'Date',
      statsMode: 'Mode',
      statsCorrect: 'Correct',
      statsWrong: 'Wrong',
      statsRate: 'Accuracy',
      statsExport: 'Export Results',
      statsDaily: 'Daily Challenge',
      statsDailyBest: "Today's Best",
      statsDailyPlay: 'Start Daily Challenge',

      // Daily challenge
      dailyTitle: 'Daily Challenge',
      dailyDescription: '5 random questions. How well can you do today?',
      dailyCompleted: 'Challenge completed for today!',
      dailyScore: "Today's Score",
      dailyPlayAgain: 'Come back tomorrow',

      // General
      btnStart: 'Start',
      btnRestart: 'Restart',
      btnBack: 'Back',
      btnExport: 'Export',
      langSwitch: '中文',
      langLabel: 'Language',

      // Categories
      catPistol: 'Pistol',
      catRifle: 'Rifle',
      catSmg: 'SMG/PCC',
      catShotgun: 'Shotgun',
      catSpecial: 'Special',

      // Footer
      footerNote: '⚠️ Sound sources from public online resources. For training purposes only.',

      // Settings
      settingsTitle: 'Settings',
      settingsTimer: 'Time Limit (seconds)',
      settingsVolume: 'Volume',
    }
  };

  function t(key, params = {}) {
    let text = translations[currentLang]?.[key] || translations['en'][key] || key;
    // Replace template params like {count}
    Object.keys(params).forEach(k => {
      text = text.replace(`{${k}}`, params[k]);
    });
    return text;
  }

  function setLang(lang) {
    if (translations[lang]) {
      currentLang = lang;
      return true;
    }
    return false;
  }

  function getLang() {
    return currentLang;
  }

  // Get gun display name based on current language
  function gunName(gun) {
    return currentLang === 'zh' ? (gun.name_zh || gun.name) : gun.name;
  }

  // Get category display name
  function catName(category) {
    const catMap = {
      pistol: currentLang === 'zh' ? '手枪' : 'Pistol',
      rifle: currentLang === 'zh' ? '步枪' : 'Rifle',
      smg: currentLang === 'zh' ? '冲锋枪/PCC' : 'SMG/PCC',
      shotgun: currentLang === 'zh' ? '霰弹枪' : 'Shotgun',
      special: currentLang === 'zh' ? '特殊' : 'Special',
    };
    return catMap[category] || category;
  }

  // Get gun description based on current language
  function gunDesc(gun) {
    return currentLang === 'zh' ? (gun.description_zh || gun.description_en) : gun.description_en;
  }

  return { t, setLang, getLang, gunName, catName, gunDesc, translations };
})();
