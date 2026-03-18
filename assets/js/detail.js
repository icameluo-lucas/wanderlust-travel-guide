/**
 * 目的地详情页渲染逻辑
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 获取 URL 参数中的目的地 slug
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('id') || window.location.pathname.split('/').pop().replace('.html', '');

  try {
    // 加载数据
    await window.destinationsManager.load();
    
    // 获取目的地数据
    const destination = window.destinationsManager.getBySlug(slug);
    
    if (!destination) {
      showError();
      return;
    }

    // 渲染页面
    renderDestination(destination);
    
    // 初始化动画
    initAnimations();
    
    // 更新页面标题
    document.title = `${destination.name} | Wanderlust`;

  } catch (error) {
    console.error('加载目的地详情失败:', error);
    showError();
  }
});

/**
 * 渲染目的地信息
 */
function renderDestination(destination) {
  // 英雄区
  document.getElementById('hero-image').src = destination.image;
  document.getElementById('hero-image').alt = destination.name;
  document.getElementById('location-badge').textContent = destination.location;
  document.getElementById('destination-name').textContent = destination.name;
  document.getElementById('destination-excerpt').textContent = destination.excerpt;
  document.getElementById('rating').textContent = `★ ${destination.rating}`;
  document.getElementById('review-count').textContent = destination.reviewCount;
  document.getElementById('budget-level').textContent = getBudgetText(destination.budget);
  
  // 类型标签
  const typeTagsContainer = document.getElementById('type-tags');
  typeTagsContainer.innerHTML = destination.type.map(t => 
    `<span class="type-tag">${getTypeText(t)}</span>`
  ).join('');

  // 简介
  document.getElementById('description').textContent = destination.description;

  // 实用信息
  document.getElementById('visa').textContent = destination.visa;
  document.getElementById('transport').textContent = destination.transport;
  document.getElementById('currency').textContent = destination.currency;
  document.getElementById('language').textContent = destination.language;
  document.getElementById('timezone').textContent = destination.timezone;
  document.getElementById('best-time').textContent = destination.bestTimeToVisit;

  // 行程推荐
  const itinerariesContainer = document.getElementById('itineraries-container');
  itinerariesContainer.innerHTML = destination.itineraries.map(itinerary => `
    <div class="itinerary-card reveal">
      <div class="itinerary-days">${itinerary.days}天</div>
      <h4 class="itinerary-title">${itinerary.title}</h4>
      <p class="itinerary-route">
        ${itinerary.route.map((place, index) => 
          `${index === 0 ? '<strong>' : ''}${place}${index === 0 ? '</strong>' : ''}`
        ).join(' → ')}
      </p>
    </div>
  `).join('');

  // 必去景点
  const attractionsContainer = document.getElementById('attractions-container');
  attractionsContainer.innerHTML = destination.attractions.map(attraction => `
    <div class="attraction-item reveal">
      <div class="attraction-info">
        <h4>${attraction.name}</h4>
        <p>${attraction.desc}</p>
      </div>
      <span class="attraction-duration">⏱️ ${attraction.duration}</span>
    </div>
  `).join('');

  // 美食推荐
  const foodsContainer = document.getElementById('foods-container');
  foodsContainer.innerHTML = destination.foods.map(food => `
    <div class="food-item reveal">
      <h4>${food.name}</h4>
      <p>${food.desc}</p>
    </div>
  `).join('');

  // 住宿建议
  const hotelsContainer = document.getElementById('hotels-container');
  hotelsContainer.innerHTML = destination.hotels.map(hotel => `
    <div class="hotel-item reveal">
      <div class="hotel-header">
        <h4>${hotel.name}</h4>
        <span class="hotel-level ${hotel.level}">${getLevelText(hotel.level)}</span>
      </div>
      <div class="hotel-price">${hotel.price}</div>
      <p>${hotel.desc}</p>
    </div>
  `).join('');

  // 旅行贴士
  const tipsContainer = document.getElementById('tips-container');
  tipsContainer.innerHTML = destination.tips.map(tip => `
    <li class="reveal">${tip}</li>
  `).join('');

  // 图片画廊
  const galleryContainer = document.getElementById('gallery-container');
  galleryContainer.innerHTML = destination.images.map(img => `
    <div class="gallery-item reveal hover-trigger">
      <img src="${img}" alt="${destination.name}" class="hover-trigger">
    </div>
  `).join('');
}

/**
 * 辅助函数：预算等级文本
 */
function getBudgetText(budget) {
  const map = {
    'budget': '💰 经济实惠',
    'medium': '💰💰 中等消费',
    'luxury': '💰💰💰 豪华享受'
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
 * 辅助函数：酒店等级文本
 */
function getLevelText(level) {
  const map = {
    'luxury': '豪华',
    'medium': '舒适',
    'budget': '经济'
  };
  return map[level] || level;
}

/**
 * 显示错误页面
 */
function showError() {
  document.body.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; background: #0a0a08; color: #f5f5f0;">
      <h1 style="font-size: 3rem; font-weight: 300; margin-bottom: 1rem;">目的地未找到</h1>
      <p style="color: #a0a098; margin-bottom: 2rem;">抱歉，您访问的目的地不存在</p>
      <a href="index.html" style="color: #c9a962; text-decoration: none; padding: 1rem 2rem; border: 1px solid #c9a962; border-radius: 4px; transition: all 0.3s;">
        返回目的地列表
      </a>
    </div>
  `;
}

/**
 * 初始化滚动动画
 */
function initAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  
  const revealOnScroll = () => {
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

  // 导航栏滚动效果
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

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
