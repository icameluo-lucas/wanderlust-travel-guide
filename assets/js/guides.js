/**
 * 攻略数据加载模块
 * 负责加载、筛选、搜索攻略数据
 */

class GuidesManager {
  constructor() {
    this.guides = [];
    this.loaded = false;
  }

  /**
   * 加载攻略数据
   */
  async load() {
    if (this.loaded) return this.guides;

    try {
      // 根据当前页面位置计算正确的数据路径
      const isSubPage = window.location.pathname.includes('/guides/');
      const dataPath = isSubPage ? '../data/guides.json' : 'data/guides.json';
      
      const response = await fetch(dataPath);
      const data = await response.json();
      this.guides = data.guides;
      this.loaded = true;
      return this.guides;
    } catch (error) {
      console.error('加载攻略数据失败:', error);
      throw error;
    }
  }

  /**
   * 根据 ID 获取攻略
   */
  getById(id) {
    return this.guides.find(g => g.id === id);
  }

  /**
   * 根据 slug 获取攻略
   */
  getBySlug(slug) {
    return this.guides.find(g => g.slug === slug);
  }

  /**
   * 按目的地筛选
   */
  filterByDestination(destination) {
    if (!destination || destination === 'all') return this.guides;
    return this.guides.filter(g => g.destinationId === destination);
  }

  /**
   * 按类型筛选
   */
  filterByType(type) {
    if (!type || type === 'all') return this.guides;
    return this.guides.filter(g => g.type.includes(type));
  }

  /**
   * 按天数筛选
   */
  filterByDuration(duration) {
    if (!duration || duration === 'all') return this.guides;
    
    switch (duration) {
      case 'short':
        return this.guides.filter(g => g.duration <= 3);
      case 'medium':
        return this.guides.filter(g => g.duration >= 4 && g.duration <= 7);
      case 'long':
        return this.guides.filter(g => g.duration > 7);
      default:
        return this.guides;
    }
  }

  /**
   * 按预算筛选
   */
  filterByBudget(budget) {
    if (!budget || budget === 'all') return this.guides;
    return this.guides.filter(g => g.budget === budget);
  }

  /**
   * 按难度筛选
   */
  filterByDifficulty(difficulty) {
    if (!difficulty || difficulty === 'all') return this.guides;
    return this.guides.filter(g => g.difficulty === difficulty);
  }

  /**
   * 搜索攻略（标题、摘要、目的地）
   */
  search(keyword) {
    if (!keyword) return this.guides;
    
    const lowerKeyword = keyword.toLowerCase();
    return this.guides.filter(g => 
      g.title.toLowerCase().includes(lowerKeyword) ||
      g.destination.toLowerCase().includes(lowerKeyword) ||
      g.excerpt.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * 组合筛选
   */
  filter(options = {}) {
    let result = [...this.guides];

    if (options.destination && options.destination !== 'all') {
      result = result.filter(g => g.destinationId === options.destination);
    }

    if (options.type && options.type !== 'all') {
      result = result.filter(g => g.type.includes(options.type));
    }

    if (options.duration && options.duration !== 'all') {
      result = this.filterByDuration(options.duration);
    }

    if (options.budget && options.budget !== 'all') {
      result = result.filter(g => g.budget === options.budget);
    }

    if (options.difficulty && options.difficulty !== 'all') {
      result = result.filter(g => g.difficulty === options.difficulty);
    }

    if (options.keyword) {
      result = this.search(options.keyword);
    }

    return result;
  }

  /**
   * 获取所有目的地（去重）
   */
  getDestinations() {
    return [...new Set(this.guides.map(g => g.destination))];
  }

  /**
   * 获取所有类型（去重）
   */
  getTypes() {
    const types = new Set();
    this.guides.forEach(g => {
      g.type.forEach(t => types.add(t));
    });
    return [...types];
  }

  /**
   * 排序
   */
  sort(criteria = 'rating') {
    const sorted = [...this.guides];
    
    switch (criteria) {
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'views':
        return sorted.sort((a, b) => b.views - a.views);
      case 'likes':
        return sorted.sort((a, b) => b.likes - a.likes);
      case 'newest':
        return sorted.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
      case 'duration':
        return sorted.sort((a, b) => a.duration - b.duration);
      default:
        return sorted;
    }
  }

  /**
   * 获取相关推荐（同目的地或同类型）
   */
  getRelated(currentGuide, limit = 3) {
    return this.guides
      .filter(g => g.id !== currentGuide.id)
      .filter(g => 
        g.destinationId === currentGuide.destinationId ||
        g.type.some(t => currentGuide.type.includes(t))
      )
      .slice(0, limit);
  }
}

// 创建全局实例
window.guidesManager = new GuidesManager();

// 页面加载时自动初始化
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await window.guidesManager.load();
    console.log('攻略数据加载成功');
  } catch (error) {
    console.error('攻略数据加载失败:', error);
  }
});
