/**
 * 播放器JS文件
 * 播放器相关功能
 */

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化播放器
  initPlayer();

  // 初始化播放源切换
  initSourceSwitch();

  // 初始化剧集切换
  initEpisodeSwitch();

  // 初始化键盘快捷键
  initKeyboardShortcuts();
});

/**
 * 初始化播放器
 */
function initPlayer() {
  const player = document.getElementById('video-player');
  if (!player) return;

  // 恢复播放进度
  const videoId = player.dataset.videoId;
  const savedTime = localStorage.getItem(`playback_${videoId}`);
  if (savedTime) {
    player.currentTime = parseFloat(savedTime);
  }

  // 保存播放进度
  player.addEventListener('timeupdate', function() {
    localStorage.setItem(`playback_${videoId}`, player.currentTime);
  });

  // 播放结束
  player.addEventListener('ended', function() {
    // 自动下一集
    const nextEpisode = document.querySelector('.episode-btn.active')?.nextElementSibling;
    if (nextEpisode && nextEpisode.tagName === 'A') {
      window.location.href = nextEpisode.href;
    }
  });
}

/**
 * 初始化播放源切换
 */
function initSourceSwitch() {
  const sourceBtns = document.querySelectorAll('.source-btn');

  sourceBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      // 移除所有按钮的active状态
      sourceBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      sourceBtns.forEach(b => b.classList.add('btn-outline-secondary'));

      // 设置当前按钮为active
      this.classList.add('active', 'btn-primary');
      this.classList.remove('btn-outline-secondary');

      // 获取对应的播放源URL
      const sourceIndex = this.dataset.index;
      const sourceUrl = this.dataset.url;

      if (sourceUrl) {
        // 更新播放器
        const playerWrapper = document.querySelector('.player-wrapper');
        if (playerWrapper) {
          // 判断是iframe还是video
          if (sourceUrl.includes('.m3u8') || sourceUrl.includes('.mp4')) {
            playerWrapper.innerHTML = `
              <video id="video-player" controls autoplay width="100%" height="100%">
                <source src="${sourceUrl}" type="video/mp4">
                您的浏览器不支持视频播放
              </video>
            `;
          } else {
            playerWrapper.innerHTML = `
              <iframe src="${sourceUrl}" frameborder="0" allowfullscreen="true" width="100%" height="100%"></iframe>
            `;
          }

          // 重新初始化播放器
          initPlayer();
        }
      }
    });
  });
}

/**
 * 初始化剧集切换
 */
function initEpisodeSwitch() {
  const episodeBtns = document.querySelectorAll('.episode-btn');

  episodeBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      // 如果是链接，允许默认行为
      if (this.tagName === 'A') return;

      e.preventDefault();

      // 移除所有按钮的active状态
      episodeBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      episodeBtns.forEach(b => b.classList.add('btn-outline-secondary'));

      // 设置当前按钮为active
      this.classList.add('active', 'btn-primary');
      this.classList.remove('btn-outline-secondary');

      // 获取对应的播放URL
      const playUrl = this.dataset.url;
      if (playUrl) {
        window.location.href = playUrl;
      }
    });
  });
}

/**
 * 初始化键盘快捷键
 */
function initKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    const player = document.getElementById('video-player');
    if (!player) return;

    // 空格键：播放/暂停
    if (e.code === 'Space') {
      e.preventDefault();
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
    }

    // 左箭头：快退5秒
    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      player.currentTime = Math.max(0, player.currentTime - 5);
    }

    // 右箭头：快进5秒
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      player.currentTime = Math.min(player.duration, player.currentTime + 5);
    }

    // 上箭头：增加音量
    if (e.code === 'ArrowUp') {
      e.preventDefault();
      player.volume = Math.min(1, player.volume + 0.1);
    }

    // 下箭头：减少音量
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      player.volume = Math.max(0, player.volume - 0.1);
    }

    // F键：全屏
    if (e.code === 'KeyF') {
      e.preventDefault();
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        player.requestFullscreen();
      }
    }

    // M键：静音
    if (e.code === 'KeyM') {
      e.preventDefault();
      player.muted = !player.muted;
    }
  });
}

/**
 * 全屏切换
 */
function toggleFullscreen() {
  const playerWrapper = document.querySelector('.player-wrapper');
  if (!playerWrapper) return;

  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    playerWrapper.requestFullscreen();
  }
}

/**
 * 截图功能
 */
function captureScreenshot() {
  const player = document.getElementById('video-player');
  if (!player) return;

  const canvas = document.createElement('canvas');
  canvas.width = player.videoWidth;
  canvas.height = player.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(player, 0, 0);

  // 下载截图
  const link = document.createElement('a');
  link.download = `screenshot_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * 设置播放速度
 * @param {number} speed - 播放速度
 */
function setPlaybackSpeed(speed) {
  const player = document.getElementById('video-player');
  if (!player) return;

  player.playbackRate = speed;

  // 更新按钮状态
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.classList.remove('active');
    if (parseFloat(btn.dataset.speed) === speed) {
      btn.classList.add('active');
    }
  });
}