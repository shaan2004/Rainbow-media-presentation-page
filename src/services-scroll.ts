import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initServicesScrollReveal(): void {
  const triggerSection = document.querySelector('.services-section') as HTMLElement;
  const container = document.querySelector('.graph-container') as HTMLElement | null;
  const svgElement = document.querySelector('.reveal-svg-chart') as SVGSVGElement | null;
  const popupCards = document.querySelectorAll('.popup-card');
  const dots = document.querySelectorAll('.chart-dot-group');
  
  const path = document.querySelector('#graphPath') as SVGPathElement | null;
  const progressLabel = document.querySelector('.progress-pct-val') as HTMLElement | null;
  const activeDotsLabel = document.querySelector('.active-dots-val') as HTMLElement | null;

  if (!triggerSection || popupCards.length === 0 || !container || !svgElement || !path) return;

  // Initialize the SVG path stroke dash length for drawing animation
  const pathLength = path.getTotalLength();
  path.style.strokeDasharray = `${pathLength}`;
  path.style.strokeDashoffset = `${pathLength}`;

  // SVG viewBox coordinates (1000 x 500 coordinates system)
  const dotCoords = [
    { cx: 100, cy: 420 },
    { cx: 260, cy: 200 },
    { cx: 420, cy: 350 },
    { cx: 580, cy: 120 },
    { cx: 740, cy: 280 },
    { cx: 900, cy: 50 }
  ];

  // Exact x-coordinate percentage ratios where line intersects each dot
  const thresholds = [0.10, 0.26, 0.42, 0.58, 0.74, 0.90];

  // Track if we are on a mobile device (<768px)
  const isMobile = () => window.innerWidth < 768;

  // Calculate screen coordinates of the SVG dots relative to the .graph-container
  const updateCardPositions = () => {
    if (isMobile()) {
      // Clear inline positions on mobile so flex layout stacks cards naturally
      popupCards.forEach((card) => {
        const el = card as HTMLElement;
        el.style.left = '';
        el.style.top = '';
      });
      return;
    }

    const svgRect = svgElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Scale factors between viewBox coordinates (1000 x 500) and client pixels
    const scaleX = svgRect.width / 1000;
    const scaleY = svgRect.height / 500;

    // SVG element displacement relative to the container edges
    const svgOffsetX = svgRect.left - containerRect.left;
    const svgOffsetY = svgRect.top - containerRect.top;

    popupCards.forEach((card, index) => {
      const el = card as HTMLElement;
      const { cx, cy } = dotCoords[index];

      // Absolute coordinates relative to container
      const dotX = svgOffsetX + (cx * scaleX);
      const dotY = svgOffsetY + (cy * scaleY);

      // Dynamically measure the card width and height to be perfectly responsive
      const cardWidth = el.offsetWidth || 215;
      const cardHeight = el.offsetHeight || 95;

      // Center the card horizontally relative to the dot
      let cardLeft = dotX - (cardWidth / 2);

      // Alternating UP/DOWN vertical positioning exactly at the cutting spots of the graph
      let cardTop = 0;
      const verticalOffset = 0; // Card edge sits exactly on the cutting spot dot

      if (index % 2 === 0) {
        // Even index (0, 2, 4): Valley (bottom joint) -> Pop DOWN
        cardTop = dotY + verticalOffset;
      } else {
        // Odd index (1, 3, 5): Peak (top joint) -> Pop UP
        cardTop = dotY - cardHeight - verticalOffset;
      }

      // Safety boundaries checking: keep all popup cards perfectly inside the container
      const minPadding = 15;
      const maxLeft = containerRect.width - cardWidth - minPadding;
      const maxTop = containerRect.height - cardHeight - minPadding;

      cardLeft = Math.max(minPadding, Math.min(maxLeft, cardLeft));
      cardTop = Math.max(minPadding, Math.min(maxTop, cardTop));

      el.style.left = `${cardLeft}px`;
      el.style.top = `${cardTop}px`;
    });
  };

  let scrollTriggerInstance: ScrollTrigger | null = null;

  const setupPinning = () => {
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill();
    }

    // Set initial card coordinates
    updateCardPositions();

    if (isMobile()) {
      // On mobile, clear layouts and reveal cards naturally as viewport scrolls
      dots.forEach(dot => dot.classList.add('active'));
      path.style.strokeDashoffset = '0';
      if (progressLabel) progressLabel.textContent = '100% Completed';
      if (activeDotsLabel) activeDotsLabel.textContent = '6 / 6 Active Points';
      
      // Hook simple intersection observer for card entry on mobile
      popupCards.forEach((card) => {
        const el = card as HTMLElement;
        el.classList.add('revealed');
      });
      return;
    }

    // Initialize desktop layout start states (0% progress)
    popupCards.forEach(card => card.classList.remove('revealed'));
    dots.forEach(dot => dot.classList.remove('active'));

    scrollTriggerInstance = ScrollTrigger.create({
      trigger: triggerSection,
      start: 'top top',
      end: '+=1600', // Scroll Hijack Scrub Length
      pin: true,
      pinSpacing: true,
      scrub: 0.8, // Smooth buttery scroll-scrub chasing animation
      onUpdate: (self) => {
        const progress = self.progress; // 0.0 to 1.0
        const pct = Math.round(progress * 100);

        // 1. Draw glowing curve path left-to-right matching progress
        const drawOffset = pathLength * (1 - progress);
        path.style.strokeDashoffset = `${drawOffset}`;

        // 2. Stagger-reveal popup cards and activate blinking dots when progress crosses coordinate thresholds
        let activeDotsCount = 0;

        popupCards.forEach((card, index) => {
          const threshold = thresholds[index];
          const dot = dots[index];

          if (progress >= threshold) {
            card.classList.add('revealed');
            if (dot) dot.classList.add('active');
            activeDotsCount++;
          } else {
            card.classList.remove('revealed');
            if (dot) dot.classList.remove('active');
          }
        });

        // 3. Update dashboard labels
        if (progressLabel) {
          progressLabel.textContent = `${pct}% Completed`;
        }
        if (activeDotsLabel) {
          activeDotsLabel.textContent = `${activeDotsCount} / ${dots.length} Active Points`;
        }
      }
    });
  };

  // Run on mount
  setupPinning();

  // Re-calculate coordinate coordinates on resize to remain perfectly responsive
  let resizeTimer: number;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      setupPinning();
      ScrollTrigger.refresh();
    }, 200);
  });
}
