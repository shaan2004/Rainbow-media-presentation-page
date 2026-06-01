import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initCustomCursor } from './custom-cursor';
import { initCanvasParticles } from './canvas-particles';
import { initRotatingTitles } from './rotating-titles';
import { initMetricsCounters } from './metrics-counter';
import { initNavbarController } from './navbar';
import { initContactForm } from './contact-form';
import { initServicesScrollReveal } from './services-scroll';
import { initVideoLoopControl } from './video-loop';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Kickstart Modular Systems
  initCustomCursor();
  initCanvasParticles();
  initRotatingTitles();
  initMetricsCounters();
  initNavbarController();
  initContactForm();
  initServicesScrollReveal();
  initVideoLoopControl();

  // 2. IntersectionObserver for Section Title Underlines & Stagger Cards
  initScrollObservers();

  // 3. GSAP Specific Layout Animations
  initGsapAnimations();
});

function initScrollObservers(): void {
  // A) Section Underline Drawing
  const underlineElements = document.querySelectorAll('.animated-underline');
  const underlineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;
        el.style.width = '60%'; // Draw underline to target 60% width
        underlineObserver.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  underlineElements.forEach((el) => {
    underlineObserver.observe(el);
  });



  // C) Experience Timeline Cards Entry
  const timelineNodes = document.querySelectorAll('.timeline-node');
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  timelineNodes.forEach((node) => {
    timelineObserver.observe(node);
  });
}

function initGsapAnimations(): void {
  // A) Hero Section Sequence Fade-in
  // Navbar slide, typewriter greeting, phone slide in, badges springs
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Navbar drops down
  tl.fromTo('.navbar', 
    { y: -100, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.8, delay: 0.2 }
  );

  // Left Content fades up
  tl.fromTo('.hero-left > *', 
    { y: 30, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 },
    '-=0.4'
  );

  // Hero Image container slides in from right
  tl.fromTo('.hero-image-container', 
    { x: 100, opacity: 0, scale: 0.95 }, 
    { x: 0, opacity: 1, scale: 1, duration: 0.8 },
    '-=0.6'
  );

  // Spring load for orbiting badges around phone
  tl.fromTo('.orbit-item', 
    { scale: 0, opacity: 0 }, 
    { scale: 1, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.7)' },
    '-=0.4'
  );

  // B) Tech Proficiency Bars Width fill on scroll
  const fillBars = document.querySelectorAll('.bar-fill');
  fillBars.forEach((bar) => {
    const targetWidth = bar.getAttribute('data-width') || '0%';
    
    gsap.fromTo(bar, 
      { width: '0%' }, 
      { 
        width: targetWidth, 
        duration: 1.5, 
        ease: 'power2.out',
        scrollTrigger: {
          trigger: bar,
          start: 'top 90%', // start when bar enters bottom viewport
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // C) About Section Photo Entry animation
  gsap.fromTo('.about-photo-wrapper', 
    { opacity: 0, scale: 0.9, rotateY: 15 }, 
    { 
      opacity: 1, 
      scale: 1, 
      rotateY: 0,
      duration: 1.2, 
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about-photo-wrapper',
        start: 'top 85%'
      }
    }
  );
}
