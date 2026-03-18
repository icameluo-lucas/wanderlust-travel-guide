/**
 * 目的地数据加载模块
 * 负责加载、筛选、搜索目的地数据
 */

class DestinationsManager {
  constructor() {
    this.destinations = [];
    this.loaded = false;
  }

  /**
   * 加载目的地数据
   */
  async load() {
    if (this.loaded) return this.destinations;

    try {
      // 根据当前页面位置计算正确的数据路径
      const isSubPage = window.location.pathname.includes('/destinations/');
      const dataPath = isSubPage ? '../data/destinations.json' : 'data/destinations.json';
      
      const response = await fetch(dataPath);
      const data = await response.json();
      this.destinations = data.destinations;
      this.loaded = true;
      return this.destinations;
    } catch (error) {
      console.error('加载目的地数据失败:', error);
      throw error;
    }
  }

  /**
   * 根据 ID 获取目的地
   */
  getById(id) {
    return this.destinations.find(d => d.id === id);
  }

  /**
   * 根据 slug 获取目的地
   */
  getBySlug(slug) {
    return this.destinations.find(d => d.slug === slug);
  }

  /**
   * 按大洲筛选
   */
  filterByContinent(continent) {
    if (!continent || continent === 'all') return this.destinations;
    return this.destinations.filter(d => d.continent === continent);
  }

  /**
   * 按类型筛选
   */
  filterByType(type) {
    if (!type || type === 'all') return this.destinations;
    return this.destinations.filter(d => d.type.includes(type));
  }

  /**
   * 按预算筛选
   */
  filterByBudget(budget) {
    if (!budget || budget === 'all') return this.destinations;
    return this.destinations.filter(d => d.budget === budget);
  }

  /**
   * 按最佳季节筛选
   */
  filterBySeason(season) {
    if (!season || season === 'all') return this.destinations;
    return this.destinations.filter(d => d.bestSeason.includes(season));
  }

  /**
   * 搜索目的地（名称、国家、描述）
   */
  search(keyword) {
    if (!keyword) return this.destinations;
    
    const lowerKeyword = keyword.toLowerCase();
    return this.destinations.filter(d => 
      d.name.toLowerCase().includes(lowerKeyword) ||
      d.country.toLowerCase().includes(lowerKeyword) ||
      d.location.toLowerCase().includes(lowerKeyword) ||
      d.description.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * 组合筛选
   */
  filter(options = {}) {
    let result = [...this.destinations];

    if (options.continent && options.continent !== 'all') {
      result = result.filter(d => d.continent === options.continent);
    }

    if (options.type && options.type !== 'all') {
      result = result.filter(d => d.type.includes(options.type));
    }

    if (options.budget && options.budget !== 'all') {
      result = result.filter(d => d.budget === options.budget);
    }

    if (options.season && options.season !== 'all') {
      result = result.filter(d => d.bestSeason.includes(options.season));
    }

    if (options.keyword) {
      result = this.search(options.keyword);
    }

    return result;
  }

  /**
   * 获取所有大洲（去重）
   */
  getContinents() {
    return [...new Set(this.destinations.map(d => d.continent))];
  }

  /**
   * 获取所有类型（去重）
   */
  getTypes() {
    const types = new Set();
    this.destinations.forEach(d => {
      d.type.forEach(t => types.add(t));
    });
    return [...types];
  }

  /**
   * 排序
   */
  sort(criteria = 'rating') {
    const sorted = [...this.destinations];
    
    switch (criteria) {
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'reviews':
        return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      default:
        return sorted;
    }
  }
}

// 创建全局实例
window.destinationsManager = new DestinationsManager();

// 页面加载时自动初始化
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await window.destinationsManager.load();
    console.log('目的地数据加载成功');
  } catch (error) {
    console.error('目的地数据加载失败:', error);
  }
});
