// ===== LocalStorage API for LitClub =====
const STORAGE_KEY = 'litclub_progress';
const READ_KEY = 'litclub_read';
const QUESTS_KEY = 'litclub_completed_quests';
const DISCUSSIONS_KEY = 'litclub_discussions';

const LitClubStorage = {
  // Get or initialize progress
  getProgress() {
    const defaultProgress = {
      xp: 0,
      level: 1,
      achievements: [],
      streak: 0,
      lastVisit: null,
      totalWorksRead: 0,
      totalQuestsCompleted: 0
    };
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultProgress;
    
    const progress = JSON.parse(saved);
    
    // Check streak
    const today = new Date().toDateString();
    const lastVisit = progress.lastVisit;
    
    if (lastVisit) {
      const lastDate = new Date(lastVisit);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Continue streak
        progress.streak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        progress.streak = 1;
      }
    } else {
      progress.streak = 1;
    }
    
    progress.lastVisit = today;
    this.saveProgress(progress);
    
    return progress;
  },

  saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  },

  // Add XP and check level up
  addXP(amount) {
    const progress = this.getProgress();
    progress.xp += amount;
    
    // Level up formula: level * 100 XP needed
    const xpNeeded = progress.level * 100;
    if (progress.xp >= xpNeeded) {
      progress.level += 1;
      progress.xp -= xpNeeded;
      this.showLevelUp(progress.level);
    }
    
    this.saveProgress(progress);
    return progress;
  },

  showLevelUp(newLevel) {
    // Simple notification - can be enhanced
    console.log(`🎉 Level up! Now level ${newLevel}`);
  },

  // Mark work as read
  markWorkRead(workId) {
    const read = this.getReadWorks();
    if (!read.includes(workId)) {
      read.push(workId);
      localStorage.setItem(READ_KEY, JSON.stringify(read));
      
      const progress = this.getProgress();
      progress.totalWorksRead = read.length;
      this.saveProgress(progress);
      
      // Award XP for reading
      this.addXP(20);
    }
  },

  getReadWorks() {
    const saved = localStorage.getItem(READ_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  isWorkRead(workId) {
    return this.getReadWorks().includes(workId);
  },

  // Quests
  completeQuest(questId) {
    const quests = this.getCompletedQuests();
    if (!quests.includes(questId)) {
      quests.push(questId);
      localStorage.setItem(QUESTS_KEY, JSON.stringify(quests));
      
      const progress = this.getProgress();
      progress.totalQuestsCompleted = quests.length;
      this.saveProgress(progress);
      
      // Award XP for quest
      this.addXP(50);
    }
  },

  getCompletedQuests() {
    const saved = localStorage.getItem(QUESTS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  isQuestCompleted(questId) {
    return this.getCompletedQuests().includes(questId);
  },

  // Discussions - save chat history
  saveDiscussion(workId, messages) {
    const discussions = this.getAllDiscussions();
    discussions[workId] = messages;
    localStorage.setItem(DISCUSSIONS_KEY, JSON.stringify(discussions));
  },

  getDiscussion(workId) {
    const discussions = this.getAllDiscussions();
    return discussions[workId] || [];
  },

  getAllDiscussions() {
    const saved = localStorage.getItem(DISCUSSIONS_KEY);
    return saved ? JSON.parse(saved) : {};
  },

  // Achievements
  unlockAchievement(achievementId) {
    const progress = this.getProgress();
    if (!progress.achievements.includes(achievementId)) {
      progress.achievements.push(achievementId);
      this.saveProgress(progress);
      this.addXP(100); // Bonus XP for achievement
      return true;
    }
    return false;
  },

  hasAchievement(achievementId) {
    const progress = this.getProgress();
    return progress.achievements.includes(achievementId);
  },

  // Check and award achievements
  checkAchievements() {
    const progress = this.getProgress();
    
    // Reading achievements
    if (progress.totalWorksRead >= 1) this.unlockAchievement('first_book');
    if (progress.totalWorksRead >= 10) this.unlockAchievement('ten_books');
    if (progress.totalWorksRead >= 50) this.unlockAchievement('fifty_books');
    
    // Quest achievements
    if (progress.totalQuestsCompleted >= 1) this.unlockAchievement('first_quest');
    if (progress.totalQuestsCompleted >= 10) this.unlockAchievement('quest_master');
    
    // Streak achievements
    if (progress.streak >= 7) this.unlockAchievement('week_streak');
    if (progress.streak >= 30) this.unlockAchievement('month_streak');
    
    // Level achievements
    if (progress.level >= 5) this.unlockAchievement('level_5');
    if (progress.level >= 10) this.unlockAchievement('level_10');
  }
};

// Make available globally
window.LitClubStorage = LitClubStorage;
