export function initRotatingTitles(): void {
  // 1. Typewriter Animation for "Hi, I'm MDK"
  const greetingEl = document.getElementById('typewriter-greeting');
  if (greetingEl) {
    const text = greetingEl.getAttribute('data-text') || "Hi, I'm MDK";
    greetingEl.textContent = "";
    let charIndex = 0;

    function typeChar(): void {
      if (charIndex < text.length) {
        greetingEl!.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(typeChar, 60); // 60ms per character as requested
      }
    }

    // Delay typewriter slightly to synchronize with page fade-in
    setTimeout(typeChar, 400);
  }

  // 2. Rotating Subtitles ("Digital Strategist" -> "Brand Builder" -> "Growth Hacker")
  const titles = document.querySelectorAll('.rotating-title');
  if (titles.length === 0) return;

  let currentTitleIndex = 0;
  const rotationInterval = 2500; // 2.5 seconds as requested

  function rotateTitle(): void {
    // Fade out current active
    const activeTitle = titles[currentTitleIndex];
    if (activeTitle) {
      activeTitle.classList.remove('active');
    }

    // Increment index
    currentTitleIndex = (currentTitleIndex + 1) % titles.length;

    // Fade in next active
    const nextTitle = titles[currentTitleIndex];
    if (nextTitle) {
      nextTitle.classList.add('active');
    }
  }

  // Initialize first title active state on load
  if (titles[0]) {
    titles[0].classList.add('active');
  }

  // Set looping interval
  setInterval(rotateTitle, rotationInterval);
}
