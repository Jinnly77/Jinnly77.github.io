import { useEffect, useRef } from "react";

interface WaveParticle {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  phaseX: number;
  phaseY: number;
  frequencyX: number;
  frequencyY: number;
  amplitudeX: number;
  amplitudeY: number;
  hue: number;
  radius: number;
  opacity: number;
}

export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<WaveParticle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const time = useRef(0);
  const animationId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
      initParticles();
    };

    const colors = [
      { hue: 280, name: "mauve" },
      { hue: 320, name: "pink" },
      { hue: 200, name: "blue" },
      { hue: 170, name: "teal" },
      { hue: 340, name: "rose" },
    ];

    const initParticles = () => {
      particles.current = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 8000);
      
      for (let i = 0; i < numParticles; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particles.current.push({
          baseX: Math.random() * canvas.width,
          baseY: Math.random() * canvas.height,
          x: 0,
          y: 0,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          frequencyX: 0.5 + Math.random() * 1.2,
          frequencyY: 0.5 + Math.random() * 1.2,
          amplitudeX: 15 + Math.random() * 20,
          amplitudeY: 15 + Math.random() * 20,
          hue: color.hue + Math.random() * 20 - 10,
          radius: 1.5 + Math.random() * 2,
          opacity: 0.15 + Math.random() * 0.15,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time.current += 0.008;

      const dataTheme = document.documentElement.getAttribute("data-theme") || "dark";
      const isDark = dataTheme === "dark";
      const mouseWaveSpeed = 2.5;
      const mouseWaveRadius = 380;

      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];

        const naturalWaveX = 
          Math.sin(time.current * p.frequencyX + p.phaseX) * p.amplitudeX +
          Math.sin(time.current * p.frequencyX * 1.5 + p.phaseX * 2) * p.amplitudeX * 0.4 +
          Math.cos(time.current * p.frequencyX * 0.6 + p.phaseY) * p.amplitudeY * 0.3;

        const naturalWaveY = 
          Math.cos(time.current * p.frequencyY + p.phaseY) * p.amplitudeY +
          Math.cos(time.current * p.frequencyY * 1.3 + p.phaseY * 2) * p.amplitudeY * 0.4 +
          Math.sin(time.current * p.frequencyY * 0.7 + p.phaseX) * p.amplitudeX * 0.3;

        const dx = p.baseX - mouseRef.current.x;
        const dy = p.baseY - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let mouseWaveX = 0;
        let mouseWaveY = 0;

        if (distance < mouseWaveRadius && distance > 1) {
          const wavePhase = (time.current * mouseWaveSpeed - distance * 0.02) % (Math.PI * 2);
          const influence = Math.max(0, 1 - distance / mouseWaveRadius);
          const amplitude = 40 * influence;

          mouseWaveX = Math.sin(wavePhase + p.phaseX) * amplitude * (dx / distance);
          mouseWaveY = Math.sin(wavePhase + p.phaseX) * amplitude * (dy / distance);
        }

        p.x = p.baseX + naturalWaveX + mouseWaveX;
        p.y = p.baseY + naturalWaveY + mouseWaveY;

        const distFromMouse = Math.sqrt(
          Math.pow(p.x - mouseRef.current.x, 2) + Math.pow(p.y - mouseRef.current.y, 2)
        );

        const normalizedDist = Math.min(distFromMouse / 380, 1);
        const size = p.radius * (0.5 + normalizedDist * 1.2);
        const alpha = p.opacity * (0.35 + normalizedDist * 0.4);

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        const lightness = isDark ? 55 : 45;
        const saturation = isDark ? 70 : 60;
        gradient.addColorStop(0, `hsla(${p.hue}, ${saturation}%, ${lightness}%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, ${saturation}%, ${lightness}%, ${alpha * 0.4})`);
        gradient.addColorStop(1, `hsla(${p.hue}, ${saturation}%, ${lightness}%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationId.current = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
