/**
 * 攻略详情页渲染逻辑
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 加载数据
    await window.guidesManager.load();
    
    // 获取 URL 参数中的攻略 slug
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('id');
    
    if (!slug) {
      showError('缺少攻略 ID 参数');
      return;
    }
    
    // 获取攻略数据
    const guide = window.guidesManager.getBySlug(slug);
    
    if (!guide) {
      showError('攻略未找到');
      return;
    }

    // 渲染页面
    renderGuide(guide);
    
    // 初始化动画和目录
    initAnimations();
    initTOC(guide);
    
    // 更新页面标题
    document.title = `${guide.title} | Wanderlust`;

  } catch (error) {
    console.error('加载攻略详情失败:', error);
    showError('加载失败：' + error.message);
  }
});

/**
 * 渲染攻略信息
 */
function renderGuide(guide) {
  // 英雄区
  document.getElementById('guide-cover').src = guide.coverImage;
  document.getElementById('guide-cover').alt = guide.title;
  document.getElementById('destination-badge').textContent = guide.destination;
  document.getElementById('read-time').textContent = guide.readTime;
  document.getElementById('rating').textContent = guide.rating.toFixed(1);
  document.getElementById('views').textContent = formatNumber(guide.views);
  document.getElementById('guide-title').textContent = guide.title;
  document.getElementById('guide-excerpt').textContent = guide.excerpt;
  
  // 作者信息
  document.getElementById('author-avatar').src = guide.author.avatar;
  document.getElementById('author-name').textContent = guide.author.name;
  document.getElementById('author-bio').textContent = guide.author.bio;
  document.getElementById('publish-date').textContent = formatDate(guide.publishDate);
  
  // 基本信息
  document.getElementById('duration').textContent = `${guide.duration}天`;
  document.getElementById('budget').textContent = getBudgetText(guide.budget);
  document.getElementById('difficulty').textContent = getDifficultyText(guide.difficulty);
  
  // 类型标签
  const typeTagsContainer = document.getElementById('type-tags');
  typeTagsContainer.innerHTML = guide.type.map(t => 
    `<span class="type-tag">${getTypeText(t)}</span>`
  ).join('');

  // 行程亮点（从 sections 中提取）
  const highlightsContainer = document.getElementById('highlights-container');
  const highlightSections = guide.sections.filter(s => 
    s.title.includes('亮点') || s.title.includes('特色') || s.title.includes('概览')
  );
  
  if (highlightSections.length > 0) {
    highlightsContainer.innerHTML = highlightSections.map(section => `
      <div class="highlight-card reveal">
        <h4>${section.title}</h4>
        <p>${section.content}</p>
      </div>
    `).join('');
  } else {
    // 如果没有亮点 section，显示前 3 个内容
    highlightsContainer.innerHTML = guide.sections.slice(0, 3).map(section => `
      <div class="highlight-card reveal">
        <h4>${section.title}</h4>
        <p>${section.content.substring(0, 100)}...</p>
      </div>
    `).join('');
  }

  // 每日行程
  const timelineContainer = document.getElementById('timeline-container');
  const itinerarySection = guide.sections.find(s => s.title.includes('行程'));
  
  if (itinerarySection && itinerarySection.subsections) {
    timelineContainer.innerHTML = itinerarySection.subsections.map(day => `
      <div class="timeline-item reveal">
        <div class="timeline-day">第${day.day}天</div>
        <h3 class="timeline-title">${day.title}</h3>
        <p class="timeline-content">${day.content}</p>
      </div>
    `).join('');
  } else {
    timelineContainer.innerHTML = '<p class="timeline-content">暂无详细行程安排</p>';
  }

  // 实用信息
  const practicalContainer = document.getElementById('practical-content');
  const practicalSections = guide.sections.filter(s => 
    s.title.includes('交通') || s.title.includes('住宿') || s.title.includes('美食') || 
    s.title.includes('预算') || s.title.includes('贴士') || s.title.includes('指南')
  );
  
  practicalContainer.innerHTML = practicalSections.map(section => `
    <div class="practical-item reveal">
      <h3>${section.title}</h3>
      ${section.content ? `<p>${section.content}</p>` : ''}
      ${section.items ? `<ul>${section.items.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
    </div>
  `).join('');

  // 图片画廊
  const galleryContainer = document.getElementById('gallery-container');
  galleryContainer.innerHTML = guide.images.map(img => `
    <div class="gallery-item reveal hover-trigger">
      <img src="${img}" alt="${guide.title}" class="hover-trigger">
    </div>
  `).join('');

  // 相关推荐
  const relatedContainer = document.getElementById('related-container');
  const relatedGuides = window.guidesManager.getRelated(guide, 3);
  
  if (relatedGuides.length > 0) {
    relatedContainer.innerHTML = relatedGuides.map(related => `
      <a href="template.html?id=${related.slug}" class="related-card reveal hover-trigger">
        <img class="related-image" src="${related.coverImage}" alt="${related.title}">
        <div class="related-overlay">
          <span class="related-destination">${related.destination}</span>
          <h3 class="related-title">${related.title}</h3>
          <div class="related-meta">
            <span>📅 ${related.duration}天</span>
            <span>⭐ ${related.rating.toFixed(1)}</span>
          </div>
        </div>
      </a>
    `).join('');
  } else {
    relatedContainer.style.display = 'none';
  }
}

/**
 * 初始化目录
 */
function initTOC(guide) {
  const tocList = document.getElementById('toc-list');
  tocList.innerHTML = guide.sections.map((section, index) => `
    <li><a href="#section-${index}">${section.title}</a></li>
  `).join('');
}

/**
 * 辅助函数
 */
function getBudgetText(budget) {
  const map = {
    'budget': '💰 经济实惠',
    'medium': '💰💰 中等消费',
    'luxury': '💰💰💰 豪华享受'
  };
  return map[budget] || budget;
}

function getDifficultyText(difficulty) {
  const map = {
    'easy': '⭐ 轻松',
    'medium': '⭐⭐ 中等',
    'hard': '⭐⭐⭐ 挑战'
  };
  return map[difficulty] || difficulty;
}

function getTypeText(type) {
  const map = {
    'nature': '🏔️ 自然',
    'adventure': '🧗 冒险',
    'culture': '🏛️ 文化',
    'history': '📜 历史',
    'photography': '📷 摄影',
    'food': '🍽️ 美食',
    'wine': '🍷 美酒',
    'wellness': '💆 疗愈',
    'spiritual': '🧘 灵修',
    'beach': '🏖️ 海滩',
    'art': '🎨 艺术',
    'city': '🏙️ 城市',
    'countryside': '🌾 乡村'
  };
  return map[type] || type;
}

function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  return num.toString();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * 显示错误页面
 */
function showError(message) {
  document.body.innerHTML = `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; background: #0a0a08; color: #f5f5f0;">
      <h1 style="font-size: 3rem; font-weight: 300; margin-bottom: 1rem;">攻略未找到</h1>
      <p style="color: #a0a098; margin-bottom: 2rem;">${message}</p>
      <a href="index.html" style="color: #c9a962; text-decoration: none; padding: 1rem 2rem; border: 1px solid #c9a962; border-radius: 4px; transition: all 0.3s;">
        返回攻略列表
      </a>
    </div>
  `;
}

/**
 * 初始化动画
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
  revealOnScroll();

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
