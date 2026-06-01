interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export function initCanvasParticles(): void {
  const canvas = document.getElementById('particles-bg') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let animationFrameId: number;
  let particles: Particle[] = [];
  const maxParticles = 60;
  const connectionDistance = 110;
  const dotColor = 'rgba(0, 200, 83, 0.45)'; // #00C853 with opacity

  // Set sizing
  function resizeCanvas(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  // Initialize nodes
  function initParticles(): void {
    particles = [];
    const w = canvas.width;
    const h = canvas.height;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        // Extremely slow drift speed
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        radius: Math.random() * 1.5 + 1.5 // 1.5px to 3px
      });
    }
  }

  // Render loop
  function animate(): void {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);

    const len = particles.length;

    // 1. Draw connections first
    for (let i = 0; i < len; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < len; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.12; // fade out with distance
          ctx!.strokeStyle = `rgba(0, 200, 83, ${alpha})`;
          ctx!.lineWidth = 0.8;
          ctx!.beginPath();
          ctx!.moveTo(p1.x, p1.y);
          ctx!.lineTo(p2.x, p2.y);
          ctx!.stroke();
        }
      }
    }

    // 2. Draw nodes and update positions
    for (let i = 0; i < len; i++) {
      const p = particles[i];
      ctx!.fillStyle = dotColor;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx!.fill();

      // Slow drift
      p.x += p.vx;
      p.y += p.vy;

      // Wall bounce
      if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx;
      if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy;
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  // Performance helper: Pause when tab is out of focus
  function handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      cancelAnimationFrame(animationFrameId);
    } else {
      animate();
    }
  }

  // Bind Listeners
  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Kickstart
  resizeCanvas();
  animate();
}
