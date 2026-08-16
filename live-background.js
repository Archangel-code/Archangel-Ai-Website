(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const scene = document.createElement("div");
  scene.className = "live-background";
  scene.setAttribute("aria-hidden", "true");
  scene.innerHTML = `
    <div class="live-background__drift">
      <div class="live-background__image"></div>
    </div>
    <canvas class="live-background__stars"></canvas>
    <div class="live-background__glow"></div>
  `;
  document.body.prepend(scene);

  if (reduceMotion.matches) {
    return;
  }

  const canvas = scene.querySelector(".live-background__stars");
  const context = canvas.getContext("2d");
  const root = document.documentElement;

  if (!context) {
    return;
  }

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let stars = [];
  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  let lastFrame = 0;
  let frameId = 0;
  let meteor = null;
  let nextMeteorAt = performance.now() + 5000 + Math.random() * 5000;

  const makeStars = () => {
    const count = Math.min(140, Math.max(42, Math.floor((width * height) / 18000)));
    stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.35 + Math.random() * 1.05,
      alpha: 0.18 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      speed: 0.00045 + Math.random() * 0.0011,
      depth: 0.12 + Math.random() * 0.55,
    }));
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    makeStars();
  };

  const createMeteor = (time) => {
    const fromLeft = Math.random() > 0.5;
    meteor = {
      start: time,
      duration: 1150 + Math.random() * 500,
      x: fromLeft ? width * (0.05 + Math.random() * 0.3) : width * (0.65 + Math.random() * 0.3),
      y: height * (0.06 + Math.random() * 0.28),
      vx: (fromLeft ? 1 : -1) * (190 + Math.random() * 150),
      vy: 95 + Math.random() * 80,
    };
    nextMeteorAt = time + 7000 + Math.random() * 9000;
  };

  const drawMeteor = (time) => {
    if (!meteor && time >= nextMeteorAt) {
      createMeteor(time);
    }

    if (!meteor) {
      return;
    }

    const progress = (time - meteor.start) / meteor.duration;
    if (progress >= 1) {
      meteor = null;
      return;
    }

    const seconds = (time - meteor.start) / 1000;
    const x = meteor.x + meteor.vx * seconds;
    const y = meteor.y + meteor.vy * seconds;
    const length = 64;
    const magnitude = Math.hypot(meteor.vx, meteor.vy);
    const tailX = x - (meteor.vx / magnitude) * length;
    const tailY = y - (meteor.vy / magnitude) * length;
    const fade = Math.sin(progress * Math.PI) * 0.72;
    const gradient = context.createLinearGradient(tailX, tailY, x, y);
    gradient.addColorStop(0, "rgba(126, 171, 255, 0)");
    gradient.addColorStop(0.72, `rgba(151, 191, 255, ${fade * 0.55})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${fade})`);
    context.strokeStyle = gradient;
    context.lineWidth = 1.4;
    context.beginPath();
    context.moveTo(tailX, tailY);
    context.lineTo(x, y);
    context.stroke();
  };

  const draw = (time) => {
    frameId = window.requestAnimationFrame(draw);
    if (time - lastFrame < 32) {
      return;
    }
    lastFrame = time;

    pointerX += (targetX - pointerX) * 0.055;
    pointerY += (targetY - pointerY) * 0.055;
    root.style.setProperty("--live-bg-pointer-x", `${pointerX.toFixed(2)}px`);
    root.style.setProperty("--live-bg-pointer-y", `${pointerY.toFixed(2)}px`);

    context.clearRect(0, 0, width, height);
    for (const star of stars) {
      const twinkle = 0.62 + Math.sin(star.phase + time * star.speed) * 0.38;
      const x = star.x * width + pointerX * star.depth * -0.7;
      const y = star.y * height + pointerY * star.depth * -0.7;
      context.fillStyle = `rgba(215, 230, 255, ${star.alpha * twinkle})`;
      context.beginPath();
      context.arc(x, y, star.radius, 0, Math.PI * 2);
      context.fill();
    }

    drawMeteor(time);
  };

  const updatePointer = (event) => {
    const normalizedX = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
    const normalizedY = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
    targetX = normalizedX * -18;
    targetY = normalizedY * -12;
  };

  const resetPointer = () => {
    targetX = 0;
    targetY = 0;
  };

  const updateAnimationState = () => {
    if (document.hidden) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      return;
    }

    if (!frameId) {
      lastFrame = performance.now();
      frameId = window.requestAnimationFrame(draw);
    }
  };

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", updatePointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", resetPointer, { passive: true });
  document.addEventListener("visibilitychange", updateAnimationState);

  resize();
  updateAnimationState();
})();
