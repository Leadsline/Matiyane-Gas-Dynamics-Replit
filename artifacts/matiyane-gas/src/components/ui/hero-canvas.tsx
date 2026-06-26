import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulseOffset: number;
}

interface EnergyRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  alpha: number;
  color: string;
}

interface LightSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let energyRings: EnergyRing[] = [];
    let lightSparks: LightSpark[] = [];
    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      ctx!.scale(dpr, dpr);
      canvas.style.width = parent.clientWidth + "px";
      canvas.style.height = parent.clientHeight + "px";
    };

    window.addEventListener("resize", resize);
    resize();

    const getCanvasSize = () => {
      const parent = canvas!.parentElement;
      return { w: parent?.clientWidth || 1920, h: parent?.clientHeight || 1080 };
    };

    const createParticle = (): Particle => {
      const { w, h } = getCanvasSize();
      const hue = Math.random() > 0.6 ? 150 + Math.random() * 40 : 170 + Math.random() * 60; // green to teal
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2.5 + 0.5,
        color: `hsl(${hue}, 80%, 60%)`,
        alpha: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    };

    // Cylinder center position (matches the img element at right: 8%, bottom: -5%, height: 95% on desktop)
    const getCylinderCenter = () => {
      const { w, h } = getCanvasSize();
      const isMobile = w < 768;
      return {
        cx: isMobile ? w * 0.78 : w * 0.58,
        cy: isMobile ? h * 0.82 : h * 0.52,
      };
    };

    const createEnergyRing = (): EnergyRing => {
      const { cx, cy } = getCylinderCenter();
      const maxR = 50 + Math.random() * 180;
      return {
        x: cx + (Math.random() - 0.5) * 200,
        y: cy + (Math.random() - 0.5) * 150,
        radius: 0,
        maxRadius: maxR,
        speed: 0.5 + Math.random() * 1.5,
        alpha: 0.6,
        color: Math.random() > 0.5 ? "120, 80%, 55%" : "170, 80%, 60%", // green or teal
      };
    };

    const createLightSpark = (): LightSpark => {
      const { cx, cy } = getCylinderCenter();
      // Spawn sparks around the cylinder, then drift outward
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 200;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const hue = Math.random() > 0.5 ? 120 + Math.random() * 30 : 160 + Math.random() * 40;
      return {
        x, y,
        vx: Math.cos(angle) * (0.3 + Math.random() * 0.8),
        vy: Math.sin(angle) * (0.3 + Math.random() * 0.8),
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        life: 0,
        maxLife: 60 + Math.random() * 120,
        color: `hsl(${hue}, 85%, 65%)`,
      };
    };

    const init = () => {
      const { w, h } = getCanvasSize();
      particles = [];
      const count = Math.min(80, Math.floor((w * h) / 25000));
      for (let i = 0; i < count; i++) {
        particles.push(createParticle());
      }
      energyRings = [];
      for (let i = 0; i < 5; i++) {
        energyRings.push(createEnergyRing());
      }
      lightSparks = [];
    };

    const drawEnergyRing = (ring: EnergyRing) => {
      if (!ctx) return;
      const gradient = ctx.createRadialGradient(ring.x, ring.y, ring.radius * 0.5, ring.x, ring.y, ring.radius);
      gradient.addColorStop(0, `hsla(${ring.color}, 0)`);
      gradient.addColorStop(0.5, `hsla(${ring.color}, ${ring.alpha * 0.3})`);
      gradient.addColorStop(1, `hsla(${ring.color}, 0)`);
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${ring.color}, ${ring.alpha * 0.5})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const drawGlow = (x: number, y: number, radius: number, color: string, alpha: number) => {
      if (!ctx) return;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `hsla(${color}, ${alpha})`);
      gradient.addColorStop(0.5, `hsla(${color}, ${alpha * 0.3})`);
      gradient.addColorStop(1, `hsla(${color}, 0)`);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    const animate = () => {
      if (!ctx) return;
      const { w, h } = getCanvasSize();
      ctx.clearRect(0, 0, w, h);
      time += 0.016;

      // Draw ambient energy glows around cylinder
      const { cx, cy } = getCylinderCenter();
      drawGlow(cx, cy, 200 + Math.sin(time * 0.5) * 30, "160, 80%, 50%", 0.08);
      drawGlow(cx + 40, cy + 20, 150 + Math.sin(time * 0.7 + 1) * 20, "120, 80%, 55%", 0.06);

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7;
        const alpha = p.alpha * pulse;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("hsl", "hsla").replace(")", `, ${alpha})`);
        ctx.fill();

        // Draw glow for larger particles
        if (p.radius > 1.5) {
          drawGlow(p.x, p.y, p.radius * 4, p.color.replace("hsl(", "").replace(")", ""), alpha * 0.3);
        }

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(100, 220, 180, ${0.15 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw energy rings
      for (let i = 0; i < energyRings.length; i++) {
        const ring = energyRings[i];
        ring.radius += ring.speed;
        ring.alpha *= 0.985;

        if (ring.alpha < 0.01 || ring.radius > ring.maxRadius) {
          energyRings[i] = createEnergyRing();
        } else {
          drawEnergyRing(ring);
        }
      }

      // Spawn new light sparks
      if (Math.random() < 0.03) {
        lightSparks.push(createLightSpark());
      }

      // Draw light sparks
      for (let i = lightSparks.length - 1; i >= 0; i--) {
        const spark = lightSparks[i];
        spark.life++;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.99;
        spark.vy *= 0.99;

        const lifeRatio = spark.life / spark.maxLife;
        const alpha = spark.alpha * (1 - lifeRatio);

        if (spark.life >= spark.maxLife) {
          lightSparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size * (1 - lifeRatio * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = spark.color.replace("hsl", "hsla").replace(")", `, ${alpha})`);
        ctx.fill();

        // Star cross effect
        const arm = spark.size * 2 * (1 - lifeRatio);
        ctx.beginPath();
        ctx.moveTo(spark.x - arm, spark.y);
        ctx.lineTo(spark.x + arm, spark.y);
        ctx.moveTo(spark.x, spark.y - arm);
        ctx.lineTo(spark.x, spark.y + arm);
        ctx.strokeStyle = spark.color.replace("hsl", "hsla").replace(")", `, ${alpha * 0.5})`);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw sweeping light streaks orbiting the cylinder
      const streakCount = 3;
      for (let i = 0; i < streakCount; i++) {
        const t = (time * 0.3 + i * (Math.PI * 2 / streakCount)) % (Math.PI * 2);
        const r = 100 + Math.sin(t) * 80;
        const sx = cx + Math.cos(t) * r;
        const sy = cy + Math.sin(t) * r;
        const streakLen = 30 + Math.sin(time * 2 + i) * 15;
        const streakAngle = t + Math.PI / 4;

        const gradient = ctx.createLinearGradient(
          sx - Math.cos(streakAngle) * streakLen,
          sy - Math.sin(streakAngle) * streakLen,
          sx + Math.cos(streakAngle) * streakLen,
          sy + Math.sin(streakAngle) * streakLen
        );
        gradient.addColorStop(0, "rgba(100, 255, 180, 0)");
        gradient.addColorStop(0.5, "rgba(100, 255, 200, 0.4)");
        gradient.addColorStop(1, "rgba(100, 255, 180, 0)");

        ctx.beginPath();
        ctx.moveTo(sx - Math.cos(streakAngle) * streakLen, sy - Math.sin(streakAngle) * streakLen);
        ctx.lineTo(sx + Math.cos(streakAngle) * streakLen, sy + Math.sin(streakAngle) * streakLen);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
