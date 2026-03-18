/**
 * 攻略列表页逻辑
 * 负责筛选、搜索、排序和渲染
 */

let currentGuides = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 加载数据
    await window.guidesManager.load();
    
    // 初始化目的地筛选器
    initDestinationFilter();
    
    // 初始渲染
    currentGuides = window.guidesManager.guides;
    renderGuides(currentGuides);
    
    // 绑定事件
    bindEvents();
    
    // 初始化动画
    initAnimations();

  } catch (error) {
    console.error('加载列表页失败:', error);
  }
});

/**
 * 初始化目的地筛选器
 */
function initDestinationFilter() {
  const destinations = window.guidesManager.getDestinations();
  const select = document.getElementById('destination-filter');
  
  destinations.forEach(dest => {
    const option = document.createElement('option');
    option.value = dest.toLowerCase().replace(/[^a-z]/g, '');
    option.textContent = dest;
    select.appendChild(option);
  });
}

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
  document.getElementById('destination-filter').addEventListener('change', applyFilters);
  document.getElementById('type-filter').addEventListener('change', applyFilters);
  document.getElementById('duration-filter').addEventListener('change', applyFilters);
  document.getElementById('budget-filter').addEventListener('change', applyFilters);
  document.getElementById('difficulty-filter').addEventListener('change', applyFilters);

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
  const destination = document.getElementById('destination-filter').value;
  const type = document.getElementById('type-filter').value;
  const duration = document.getElementById('duration-filter').value;
  const budget = document.getElementById('budget-filter').value;
  const difficulty = document.getElementById('difficulty-filter').value;
  const searchKeyword = keyword !== null ? keyword : document.getElementById('search-input').value.trim();

  const options = {
    destination: destination !== 'all' ? destination : null,
    type: type !== 'all' ? type : null,
    duration: duration !== 'all' ? duration : null,
    budget: budget !== 'all' ? budget : null,
    difficulty: difficulty !== 'all' ? difficulty : null,
    keyword: searchKeyword || null
  };

  currentGuides = window.guidesManager.filter(options);
  
  // 应用排序
  applySort();
}

/**
 * 应用排序
 */
function applySort() {
  const criteria = document.getElementById('sort-select').value;
  currentGuides = window.guidesManager.sort(criteria);
  
  // 重新渲染
  renderGuides(currentGuides);
}

/**
 * 重置筛选
 */
function resetFilters() {
  document.getElementById('destination-filter').value = 'all';
  document.getElementById('type-filter').value = 'all';
  document.getElementById('duration-filter').value = 'all';
  document.getElementById('budget-filter').value = 'all';
  document.getElementById('difficulty-filter').value = 'all';
  document.getElementById('search-input').value = '';
  document.getElementById('sort-select').value = 'rating';
  
  currentGuides = window.guidesManager.guides;
  renderGuides(currentGuides);
}

/**
 * 渲染攻略列表
 */
function renderGuides(guides) {
  const grid = document.getElementById('guides-grid');
  const noResults = document.getElementById('no-results');
  const resultsCount = document.getElementById('results-count');

  // 更新结果计数
  resultsCount.textContent = `找到 ${guides.length} 篇攻略`;

  if (guides.length === 0) {
    grid.style.display = 'none';
    noResults.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  noResults.style.display = 'none';

  // 渲染卡片
  grid.innerHTML = guides.map((guide, index) => `
    <a href="template.html?id=${guide.slug}" class="guide-card reveal hover-trigger" style="transition-delay: ${index * 0.05}s">
      <img class="guide-image" src="${guide.coverImage}" alt="${guide.title}" loading="lazy">
      <div class="guide-overlay">
        <span class="guide-destination">${guide.destination}</span>
        <h3 class="guide-title">${guide.title}</h3>
        <p class="guide-excerpt">${guide.excerpt}</p>
        <div class="guide-meta">
          <span class="meta-tag rating-tag">⭐ ${guide.rating.toFixed(1)}</span>
          <span class="meta-tag">📅 ${guide.duration}天</span>
          <span class="meta-tag">${getBudgetText(guide.budget)}</span>
          <span class="author-tag">
            <img src="${guide.author.avatar}" alt="${guide.author.name}">
            ${guide.author.name}
          </span>
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
  revealOnScroll();

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
