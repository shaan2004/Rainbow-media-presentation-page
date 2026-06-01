/**
 * Rainbow Media Live Engagement Video Cards Controller
 * Automatically pauses HTML5 videos when off-screen or tab is hidden,
 * saving CPU/GPU resources and ensuring peak performance.
 */
export function initVideoLoopControl() {
  const cards = document.querySelectorAll('.phone-card');
  if (!cards.length) return;

  // 1. IntersectionObserver: Pause when off-screen, play when in-screen
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Play when at least 15% of the card is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const card = entry.target as HTMLElement;
      const video = card.querySelector('video');
      if (entry.isIntersecting) {
        card.classList.remove('paused');
        if (video) {
          video.play().catch(e => {
            console.log('[Rainbow Media] Video play interrupted or requires user gesture:', e.message);
          });
        }
      } else {
        card.classList.add('paused');
        if (video) {
          video.pause();
        }
      }
    });
  }, observerOptions);

  cards.forEach(card => {
    // Start paused
    card.classList.add('paused');
    observer.observe(card);
    const video = card.querySelector('video');
    if (video) {
      video.pause();
    }
  });

  // 2. Tab Visibility API: Pause/play videos globally when changing tab
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cards.forEach(card => {
        card.classList.add('paused');
        const video = card.querySelector('video');
        if (video) video.pause();
      });
      console.log('[Rainbow Media] Tab inactive, paused all videos.');
    } else {
      triggerIntersectionCheck();
    }
  });

  function triggerIntersectionCheck() {
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      const video = card.querySelector('video');
      if (isVisible) {
        card.classList.remove('paused');
        if (video) {
          video.play().catch(() => {});
        }
      } else {
        card.classList.add('paused');
        if (video) {
          video.pause();
        }
      }
    });
  }

  console.log('[Rainbow Media] Live engagement phone loops initialized successfully.');
}
