/**
 * 主JS文件
 * 全局通用功能
 */

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化工具提示
  initTooltips();

  // 初始化图片懒加载
  initLazyLoading();

  // 初始化返回顶部按钮
  initBackToTop();

  // 自动隐藏消息提示
  initAlertAutoHide();
});

/**
 * 初始化Bootstrap工具提示
 */
function initTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

/**
 * 初始化图片懒加载
 */
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(function(img) {
      imageObserver.observe(img);
    });
  } else {
    // 降级处理
    images.forEach(function(img) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

/**
 * 初始化返回顶部按钮
 */
function initBackToTop() {
  // 创建返回顶部按钮
  const backToTopBtn = document.createElement('button');
  backToTopBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
  backToTopBtn.className = 'btn btn-primary btn-sm position-fixed bottom-0 end-0 m-3 d-none';
  backToTopBtn.id = 'backToTop';
  backToTopBtn.style.cssText = 'z-index: 1000; width: 40px; height: 40px; border-radius: 50%;';
  document.body.appendChild(backToTopBtn);

  // 监听滚动事件
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.remove('d-none');
    } else {
      backToTopBtn.classList.add('d-none');
    }
  });

  // 点击返回顶部
  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * 自动隐藏消息提示
 */
function initAlertAutoHide() {
  const alerts = document.querySelectorAll('.alert-dismissible');

  alerts.forEach(function(alert) {
    setTimeout(function() {
      const closeBtn = alert.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.click();
      }
    }, 5000);
  });
}

/**
 * 显示加载状态
 */
function showLoading() {
  const loading = document.createElement('div');
  loading.id = 'loading-overlay';
  loading.className = 'loading-overlay';
  loading.innerHTML = '<div class="loading-spinner"></div>';
  document.body.appendChild(loading);
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
  const loading = document.getElementById('loading-overlay');
  if (loading) {
    loading.remove();
  }
}

/**
 * 显示提示消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 (success/error/info/warning)
 */
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container') || createToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast show bg-${type === 'error' ? 'danger' : type} text-white`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <div class="toast-body d-flex justify-content-between align-items-center">
      <span>${message}</span>
      <button type="button" class="btn-close btn-close-white ms-2" data-bs-dismiss="toast"></button>
    </div>
  `;

  toastContainer.appendChild(toast);

  // 自动移除
  setTimeout(function() {
    toast.remove();
  }, 3000);
}

/**
 * 创建Toast容器
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'position-fixed top-0 end-0 p-3';
  container.style.zIndex = '1090';
  document.body.appendChild(container);
  return container;
}

/**
 * 格式化数字
 * @param {number} num - 数字
 * @returns {string} - 格式化后的字符串
 */
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + '千';
  }
  return num.toString();
}

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间
 * @returns {Function} - 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 限制时间
 * @returns {Function} - 节流后的函数
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}