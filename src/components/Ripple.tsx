import { useEffect, useRef } from "react";

interface RippleProps {
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export default function Ripple({ className = "", onClick, children }: RippleProps) {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const rippleRef = useRef<HTMLSpanElement | null>(null);

  const createRipple = (event: React.MouseEvent) => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple-effect");

    const ripple = buttonRef.current.getElementsByClassName("ripple-effect")[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
    rippleRef.current = circle;
  };

  useEffect(() => {
    return () => {
      if (rippleRef.current) {
        rippleRef.current.remove();
      }
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    createRipple(e);
    onClick?.(e);
  };

  const Element = onClick ? "button" : "div";

  return (
    <Element
      ref={buttonRef as any}
      className={className}
      onMouseDown={handleMouseDown}
    >
      {children}
    </Element>
  );
}
