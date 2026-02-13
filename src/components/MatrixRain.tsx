import { useEffect, useRef } from "react";

const CHARS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF";
const FONT_SIZE = 14;
const COLUMN_SPEED = 0.5;

interface Column {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  length: number;
}

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const columnsRef = useRef<Column[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initColumns();
    };

    const initColumns = () => {
      const columns: Column[] = [];
      const numColumns = Math.floor(canvas.width / FONT_SIZE);
      
      for (let i = 0; i < numColumns; i++) {
        columns.push(createColumn(i * FONT_SIZE));
      }
      columnsRef.current = columns;
    };

    const createColumn = (x: number): Column => {
      const length = Math.floor(Math.random() * 15 + 5);
      const chars: string[] = [];
      for (let i = 0; i < length; i++) {
        chars.push(CHARS[Math.floor(Math.random() * CHARS.length)]);
      }
      return {
        x,
        y: Math.random() * canvas.height * -1,
        speed: Math.random() * COLUMN_SPEED + 0.2,
        chars,
        length,
      };
    };

    const draw = () => {
      ctx.fillStyle = "rgba(5, 5, 16, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px monospace`;

      columnsRef.current.forEach((column, index) => {
        column.chars.forEach((char, charIndex) => {
          const y = column.y + charIndex * FONT_SIZE;
          if (y < 0 || y > canvas.height) return;

          const alpha = 1 - charIndex / column.length;
          if (charIndex === 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 10;
          } else {
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.8})`;
            ctx.shadowBlur = 0;
          }
          
          ctx.fillText(char, column.x, y);
          
          if (Math.random() > 0.98) {
            column.chars[charIndex] = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        });

        column.y += column.speed * FONT_SIZE;

        if (column.y > canvas.height + column.length * FONT_SIZE) {
          columnsRef.current[index] = createColumn(column.x);
        }
      });

      ctx.shadowBlur = 0;
      animationRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-rain"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.4,
      }}
    />
  );
}
