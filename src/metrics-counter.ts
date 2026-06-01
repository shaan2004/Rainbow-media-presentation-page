export function initMetricsCounters(): void {
  const counterElements = document.querySelectorAll('.metric-number');
  if (counterElements.length === 0) return;

  // Easing function: easeOutCubic
  // t: normalized time (0 to 1)
  function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el: Element): void {
    const targetText = el.getAttribute('data-target') || "";
    // Extract numbers, e.g., "500+" -> 500
    const targetValue = parseInt(targetText.replace(/[^0-9]/g, ''), 10);
    const suffix = targetText.replace(/[0-9]/g, ''); // e.g. "+" or "%"

    if (isNaN(targetValue)) return;

    const duration = 2000; // 2 seconds
    let startTime: number | null = null;

    function step(timestamp: number): void {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const t = Math.min(progress / duration, 1); // Clamp to 1

      const easedProgress = easeOutCubic(t);
      const currentValue = Math.floor(easedProgress * targetValue);

      el.textContent = `${currentValue}${suffix}`;

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = targetText; // Ensure exact final text
      }
    }

    requestAnimationFrame(step);
  }

  // Set up intersection observer to trigger counters once when in view
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el);
        observer.unobserve(el); // Count only once
      }
    });
  }, observerOptions);

  counterElements.forEach((el) => {
    // Save target text and reset to 0 to prevent static displays
    const initialText = el.textContent || "";
    el.setAttribute('data-target', initialText);
    el.textContent = `0${initialText.replace(/[0-9]/g, '')}`;
    observer.observe(el);
  });
}
