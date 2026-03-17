// 统一提示框样式
export function showToast(message, type = 'success') {
  // 移除已存在的提示框
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span class="toast-message">${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // 动画
  setTimeout(() => toast.classList.add('show'), 10);
  
  // 3 秒后移除
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 确认对话框
export function showConfirm(message) {
  return new Promise((resolve) => {
    const existing = document.querySelector('.confirm-dialog');
    if (existing) existing.remove();

    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
      <div class="confirm-overlay"></div>
      <div class="confirm-content">
        <p class="confirm-message">${message}</p>
        <div class="confirm-buttons">
          <button class="confirm-cancel">取消</button>
          <button class="confirm-ok">确定</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    setTimeout(() => dialog.classList.add('show'), 10);
    
    const cleanup = () => {
      dialog.classList.remove('show');
      setTimeout(() => dialog.remove(), 300);
    };
    
    dialog.querySelector('.confirm-cancel').addEventListener('click', () => {
      cleanup();
      resolve(false);
    });
    
    dialog.querySelector('.confirm-ok').addEventListener('click', () => {
      cleanup();
      resolve(true);
    });
  });
}
