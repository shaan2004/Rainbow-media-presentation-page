export function initNavbarController(): void {
  const navbar = document.querySelector('.navbar') as HTMLElement;
  const menuBtn = document.querySelector('.menu-btn') as HTMLButtonElement;
  const mobileNav = document.querySelector('.mobile-nav-overlay') as HTMLElement;
  const navLinks = document.querySelectorAll('.navbar-links a');
  const mobileLinks = document.querySelectorAll('.mobile-nav-overlay a');
  const sections = document.querySelectorAll('section');

  if (!navbar) return;

  // 1. Scroll Transparency to Glassmorphism transition
  function handleScroll(): void {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // 2. Active state tracking based on scroll position
    let currentSectionId = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id') || "";
      }
    });

    if (currentSectionId) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger initial scroll check

  // 3. Mobile Hamburger toggle
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const isOpen = menuBtn.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      
      // Prevent body scrolling when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile nav when clicking a link
    const closeMenu = (): void => {
      menuBtn.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    };

    mobileLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }
}
