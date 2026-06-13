/**
 * 管理后台JS文件
 * 管理后台相关功能
 */

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化侧边栏切换
  initSidebarToggle();

  // 初始化用户管理功能
  initUserManagement();

  // 初始化站点配置表单
  initSettingsForm();

  // 初始化确认对话框
  initConfirmDialogs();
});

/**
 * 初始化侧边栏切换（移动端）
 */
function initSidebarToggle() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.admin-sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('show');
      if (overlay) overlay.classList.toggle('show');
    });

    // 点击遮罩关闭侧边栏
    if (overlay) {
      overlay.addEventListener('click', function() {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
      });
    }

    // 点击侧边栏链接后关闭
    sidebar.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth < 768) {
          sidebar.classList.remove('show');
          if (overlay) overlay.classList.remove('show');
        }
      });
    });
  }
}

/**
 * 初始化用户管理功能
 */
function initUserManagement() {
  // 切换用户状态
  document.querySelectorAll('.toggle-user-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const userId = this.dataset.userId;
      const action = this.dataset.action;

      try {
        const response = await fetch(`/admin/users/${userId}/toggle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.success) {
          // 更新按钮状态
          const badge = this.closest('tr').querySelector('.status-badge');
          if (badge) {
            badge.className = `badge ${result.status === 1 ? 'bg-success' : 'bg-danger'} status-badge`;
            badge.textContent = result.status === 1 ? '启用' : '禁用';
          }

          // 更新按钮文本
          this.textContent = result.status === 1 ? '禁用' : '启用';
          this.dataset.action = result.status === 1 ? 'disable' : 'enable';

          showToast('操作成功', 'success');
        } else {
          showToast(result.message || '操作失败', 'error');
        }
      } catch (error) {
        showToast('操作失败', 'error');
      }
    });
  });

  // 删除用户
  document.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const userId = this.dataset.userId;
      const username = this.dataset.username;

      if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复。`)) {
        return;
      }

      try {
        const response = await fetch(`/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.success) {
          // 移除表格行
          this.closest('tr').remove();
          showToast('用户已删除', 'success');
        } else {
          showToast(result.message || '删除失败', 'error');
        }
      } catch (error) {
        showToast('删除失败', 'error');
      }
    });
  });

  // 重置密码
  document.querySelectorAll('.reset-password-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const userId = this.dataset.userId;
      const username = this.dataset.username;

      if (!confirm(`确定要重置用户 "${username}" 的密码吗？`)) {
        return;
      }

      try {
        const response = await fetch(`/admin/users/${userId}/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.success) {
          showToast(result.message || '密码已重置', 'success');
        } else {
          showToast(result.message || '重置失败', 'error');
        }
      } catch (error) {
        showToast('重置失败', 'error');
      }
    });
  });
}

/**
 * 初始化站点配置表单
 */
function initSettingsForm() {
  const settingsForm = document.getElementById('settingsForm');

  if (settingsForm) {
    settingsForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const formData = new FormData(this);
      const data = Object.fromEntries(formData.entries());

      fetch('/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          showToast('配置已保存', 'success');
        } else {
          showToast(result.message || '保存失败', 'error');
        }
      })
      .catch(error => {
        showToast('保存失败', 'error');
      });
    });
  }
}

/**
 * 初始化确认对话框
 */
function initConfirmDialogs() {
  document.querySelectorAll('[data-confirm]').forEach(element => {
    element.addEventListener('click', function(e) {
      const message = this.dataset.confirm;
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });
}

/**
 * 显示Toast消息
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
 * 格式化日期
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}