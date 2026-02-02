import { useState, useEffect, useRef } from "react";
import { siteConfig } from "../config";

export default function WelcomeMessage() {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const hasStartedRef = useRef(false);
  const fullText = siteConfig.welcomeMessage;
  const MAX_VISIBLE_CHARS = 25; // Max chars to show before scrolling

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let index = 0;
    setDisplayText("");
    setIsComplete(false);

    function typeChar() {
      if (index < fullText.length) {
        // If text is too long, only show the last MAX_VISIBLE_CHARS
        if (fullText.length > MAX_VISIBLE_CHARS) {
          const startIndex = Math.max(0, index - MAX_VISIBLE_CHARS + 1);
          setDisplayText(fullText.slice(startIndex, index + 1));
        } else {
          setDisplayText(fullText.slice(0, index + 1));
        }
        index++;
        setTimeout(typeChar, 80);
      } else {
        // Typing complete - show full text and center it
        setDisplayText(fullText);
        setIsComplete(true);
      }
    }

    const timer = setTimeout(typeChar, 300);
    return () => {
      clearTimeout(timer);
      hasStartedRef.current = false;
    };
  }, [fullText]);

  return (
    <div className="welcome-message">
      <p className={`welcome-text ${isComplete ? "complete" : ""}`}>
        {displayText}
        {!isComplete && <span className="cursor">|</span>}
      </p>
    </div>
  );
}
