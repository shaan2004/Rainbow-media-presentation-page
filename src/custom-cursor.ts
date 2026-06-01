import { Renderer, Transform, Vec3, Color, Polyline } from 'ogl';

export function initCustomCursor(): void {
  // Elements
  const cursor = document.querySelector('.custom-cursor') as HTMLElement;
  const container = document.getElementById('ribbon-cursor-container') as HTMLElement;

  if (!cursor || !container) return;

  // Tiny pointer dot lerp state
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  // Track global mouse position
  window.addEventListener('mousemove', (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursor.style.display = 'block';
    container.style.display = 'block';
  });

  // Track cursor pointer dot positions
  function renderCursorDot(): void {
    cursorX += (mouseX - cursorX) * 0.28;
    cursorY += (mouseY - cursorY) * 0.28;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    requestAnimationFrame(renderCursorDot);
  }
  requestAnimationFrame(renderCursorDot);

  // --- OGL Ribbons Cursor Engine ---
  const colors = ['#D4AF37', '#00C853']; // Matte Gold and Emerald Green separate parallel strands!
  const baseSpring = 0.04;
  const baseFriction = 0.88;
  const baseThickness = 12; // Sleek and elegant cursor trail
  const offsetFactor = 0.015; // Delicate separation
  const maxAge = 400; // Shorter trail life for cursor elegance
  const pointCount = 45;
  const speedMultiplier = 0.8;
  const enableFade = true;
  const enableShaderEffect = true;
  const effectAmplitude = 1.2;

  // Initialize OGL Renderer
  const renderer = new Renderer({ dpr: window.devicePixelRatio || 2, alpha: true });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  // Position canvas
  gl.canvas.style.position = 'absolute';
  gl.canvas.style.top = '0';
  gl.canvas.style.left = '0';
  gl.canvas.style.width = '100%';
  gl.canvas.style.height = '100%';
  container.appendChild(gl.canvas);

  const scene = new Transform();
  const lines: any[] = [];

  const vertex = `
    precision highp float;
    
    attribute vec3 position;
    attribute vec3 next;
    attribute vec3 prev;
    attribute vec2 uv;
    attribute float side;
    
    uniform vec2 uResolution;
    uniform float uDPR;
    uniform float uThickness;
    uniform float uTime;
    uniform float uEnableShaderEffect;
    uniform float uEffectAmplitude;
    
    varying vec2 vUV;
    
    vec4 getPosition() {
        vec4 current = vec4(position, 1.0);
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
        vec2 nextScreen = next.xy * aspect;
        vec2 prevScreen = prev.xy * aspect;
        vec2 tangent = normalize(nextScreen - prevScreen);
        vec2 normal = vec2(-tangent.y, tangent.x);
        normal /= aspect;
        normal *= mix(1.0, 0.1, pow(abs(uv.y - 0.5) * 2.0, 2.0));
        float dist = length(nextScreen - prevScreen);
        normal *= smoothstep(0.0, 0.02, dist);
        float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
        float pixelWidth = current.w * pixelWidthRatio;
        normal *= pixelWidth * uThickness;
        current.xy -= normal * side;
        if(uEnableShaderEffect > 0.5) {
          current.xy += normal * sin(uTime + current.x * 10.0) * uEffectAmplitude;
        }
        return current;
    }
    
    void main() {
        vUV = uv;
        gl_Position = getPosition();
    }
  `;

  const fragment = `
    precision highp float;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uEnableFade;
    varying vec2 vUV;
    void main() {
        float fadeFactor = 1.0;
        if(uEnableFade > 0.5) {
            fadeFactor = 1.0 - smoothstep(0.0, 1.0, vUV.y);
        }
        gl_FragColor = vec4(uColor, uOpacity * fadeFactor);
    }
  `;

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    lines.forEach(line => line.polyline.resize());
  }
  window.addEventListener('resize', resize);

  const center = (colors.length - 1) / 2;
  colors.forEach((color, index) => {
    const spring = baseSpring + (Math.random() - 0.5) * 0.01;
    const friction = baseFriction + (Math.random() - 0.5) * 0.02;
    const thickness = baseThickness + (Math.random() - 0.5) * 2;
    const mouseOffset = new Vec3(
      (index - center) * offsetFactor + (Math.random() - 0.5) * 0.005,
      (Math.random() - 0.5) * 0.02,
      0
    );

    const line: any = {
      spring,
      friction,
      mouseVelocity: new Vec3(),
      mouseOffset
    };

    const count = pointCount;
    const points: Vec3[] = [];
    for (let i = 0; i < count; i++) {
      points.push(new Vec3());
    }
    line.points = points;

    line.polyline = new Polyline(gl, {
      points,
      vertex,
      fragment,
      uniforms: {
        uColor: { value: new Color(color) },
        uThickness: { value: thickness },
        uOpacity: { value: 1.0 },
        uTime: { value: 0.0 },
        uEnableShaderEffect: { value: enableShaderEffect ? 1.0 : 0.0 },
        uEffectAmplitude: { value: effectAmplitude },
        uEnableFade: { value: enableFade ? 1.0 : 0.0 }
      }
    });
    line.polyline.mesh.setParent(scene);
    lines.push(line);
  });

  resize();

  const mouse = new Vec3();
  function updateMouse(e: MouseEvent | TouchEvent) {
    let x = 0;
    let y = 0;
    const rect = container.getBoundingClientRect();
    
    if ('changedTouches' in e && e.changedTouches && e.changedTouches.length) {
      x = e.changedTouches[0].clientX - rect.left;
      y = e.changedTouches[0].clientY - rect.top;
    } else if (e instanceof MouseEvent) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    mouse.set((x / width) * 2 - 1, (y / height) * -2 + 1, 0);
  }

  window.addEventListener('mousemove', updateMouse);
  window.addEventListener('touchstart', updateMouse);
  window.addEventListener('touchmove', updateMouse);

  const tmp = new Vec3();
  let lastTime = performance.now();
  
  function update() {
    requestAnimationFrame(update);
    const currentTime = performance.now();
    const dt = currentTime - lastTime;
    lastTime = currentTime;

    lines.forEach(line => {
      tmp.copy(mouse).add(line.mouseOffset).sub(line.points[0]).multiply(line.spring);
      line.mouseVelocity.add(tmp).multiply(line.friction);
      line.points[0].add(line.mouseVelocity);

      for (let i = 1; i < line.points.length; i++) {
        if (isFinite(maxAge) && maxAge > 0) {
          const segmentDelay = maxAge / (line.points.length - 1);
          const alpha = Math.min(1, (dt * speedMultiplier) / segmentDelay);
          line.points[i].lerp(line.points[i - 1], alpha);
        } else {
          line.points[i].lerp(line.points[i - 1], 0.9);
        }
      }
      
      const program = line.polyline.mesh.program;
      if (program.uniforms.uTime) {
        program.uniforms.uTime.value = currentTime * 0.001;
      }
      line.polyline.updateGeometry();
    });

    renderer.render({ scene });
  }
  update();

  // Hover states for interactive elements
  const hoverables = document.querySelectorAll('a, button, .btn, .service-card, .skill-pill, input, textarea, .timeline-card, .orbit-tag-content');
  hoverables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering');
    });
  });

  // Hide cursor on leaving viewport
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    container.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    container.style.opacity = '1';
  });
}
