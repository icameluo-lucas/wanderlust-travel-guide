/**
 * 目的地列表页逻辑
 * 负责筛选、搜索、排序和渲染
 */

let currentDestinations = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 加载数据
    await window.destinationsManager.load();
    
    // 初始渲染
    currentDestinations = window.destinationsManager.destinations;
    renderDestinations(currentDestinations);
    
    // 绑定事件
    bindEvents();
    
    // 初始化动画
    initAnimations();

  } catch (error) {
    console.error('加载列表页失败:', error);
  }
});

/**
 * 绑定筛选和搜索事件
 */
function bindEvents() {
  // 搜索
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  // 筛选器
  document.getElementById('continent-filter').addEventListener('change', applyFilters);
  document.getElementById('type-filter').addEventListener('change', applyFilters);
  document.getElementById('budget-filter').addEventListener('change', applyFilters);
  document.getElementById('season-filter').addEventListener('change', applyFilters);

  // 重置
  document.getElementById('reset-filters').addEventListener('click', resetFilters);

  // 排序
  document.getElementById('sort-select').addEventListener('change', applySort);
}

/**
 * 执行搜索
 */
function performSearch() {
  const keyword = document.getElementById('search-input').value.trim();
  applyFilters(keyword);
}

/**
 * 应用筛选条件
 */
function applyFilters(keyword = null) {
  const continent = document.getElementById('continent-filter').value;
  const type = document.getElementById('type-filter').value;
  const budget = document.getElementById('budget-filter').value;
  const season = document.getElementById('season-filter').value;
  const searchKeyword = keyword !== null ? keyword : document.getElementById('search-input').value.trim();

  const options = {
    continent: continent !== 'all' ? continent : null,
    type: type !== 'all' ? type : null,
    budget: budget !== 'all' ? budget : null,
    season: season !== 'all' ? season : null,
    keyword: searchKeyword || null
  };

  currentDestinations = window.destinationsManager.filter(options);
  
  // 应用排序
  applySort();
}

/**
 * 应用排序
 */
function applySort() {
  const criteria = document.getElementById('sort-select').value;
  currentDestinations = window.destinationsManager.sort(criteria);
  
  // 重新渲染
  renderDestinations(currentDestinations);
}

/**
 * 重置筛选
 */
function resetFilters() {
  document.getElementById('continent-filter').value = 'all';
  document.getElementById('type-filter').value = 'all';
  document.getElementById('budget-filter').value = 'all';
  document.getElementById('season-filter').value = 'all';
  document.getElementById('search-input').value = '';
  document.getElementById('sort-select').value = 'rating';
  
  currentDestinations = window.destinationsManager.destinations;
  renderDestinations(currentDestinations);
}

/**
 * 渲染目的地列表
 */
function renderDestinations(destinations) {
  const grid = document.getElementById('destinations-grid');
  const noResults = document.getElementById('no-results');
  const resultsCount = document.getElementById('results-count');

  // 更新结果计数
  resultsCount.textContent = `找到 ${destinations.length} 个目的地`;

  if (destinations.length === 0) {
    grid.style.display = 'none';
    noResults.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  noResults.style.display = 'none';

  // 渲染卡片
  grid.innerHTML = destinations.map((dest, index) => `
    <a href="${dest.slug}.html" class="destination-card reveal hover-trigger" style="transition-delay: ${index * 0.05}s">
      <img class="destination-image" src="${dest.image}" alt="${dest.name}" loading="lazy">
      <div class="destination-overlay">
        <span class="destination-location">${dest.location}</span>
        <h3 class="destination-name">${dest.name}</h3>
        <p class="destination-excerpt">${dest.excerpt}</p>
        <div class="destination-meta">
          <span class="meta-tag rating-tag">⭐ ${dest.rating}</span>
          <span class="meta-tag">${getBudgetText(dest.budget)}</span>
          ${dest.type.slice(0, 2).map(t => `<span class="meta-tag">${getTypeText(t)}</span>`).join('')}
        </div>
      </div>
    </a>
  `).join('');

  // 重新绑定鼠标效果
  initCursor();
  
  // 触发动画检查
  setTimeout(() => {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(reveal => {
      const elementTop = reveal.getBoundingClientRect().top;
      if (elementTop < window.innerHeight - 50) {
        reveal.classList.add('active');
      }
    });
  }, 100);
}

/**
 * 辅助函数：预算文本
 */
function getBudgetText(budget) {
  const map = {
    'budget': '💰 经济',
    'medium': '💰💰 中等',
    'luxury': '💰💰💰 豪华'
  };
  return map[budget] || budget;
}

/**
 * 辅助函数：类型文本
 */
function getTypeText(type) {
  const map = {
    'beach': '🏖️ 海滩',
    'culture': '🏛️ 文化',
    'city': '🏙️ 城市',
    'nature': '🏔️ 自然',
    'adventure': '🧗 冒险',
    'romance': '💕 浪漫',
    'art': '🎨 艺术',
    'history': '📜 历史',
    'spiritual': '🧘 灵修',
    'wellness': '💆 养生',
    'countryside': '🌾 乡村',
    'wine': '🍷 美酒'
  };
  return map[type] || type;
}

/**
 * 初始化动画
 */
function initAnimations() {
  // 导航栏滚动效果
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // 滚动显示动画
  const revealOnScroll = () => {
    const reveals = document.querySelectorAll('.reveal');
    const windowHeight = window.innerHeight;
    const elementVisible = 100;
    
    reveals.forEach(reveal => {
      const elementTop = reveal.getBoundingClientRect().top;
      if (elementTop < windowHeight - elementVisible) {
        reveal.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // 初始检查

  // 自定义鼠标
  initCursor();
}

/**
 * 自定义鼠标效果
 */
function initCursor() {
  const cursor = document.querySelector('.cursor');
  const hoverTriggers = document.querySelectorAll('.hover-trigger');

  if (!cursor) return;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  hoverTriggers.forEach(trigger => {
    trigger.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    trigger.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// 暴露全局函数供 HTML 调用
window.resetFilters = resetFilters;
