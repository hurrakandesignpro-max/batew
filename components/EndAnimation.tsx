"use client";

import React, { useState } from "react";

interface EndAnimationProps {
  message: string;
  theme: string;
  mascot: string;
}

export default function EndAnimation({ message, theme, mascot }: EndAnimationProps) {
  const [easterEggActive, setEasterEggActive] = useState(false);
  const [clicks, setClicks] = useState(0);

  const handleMascotClick = () => {
    const nextClicks = clicks + 1;
    setClicks(nextClicks);
    if (nextClicks >= 3) {
      setEasterEggActive(true);
    }
  };

  return (
    <div className={`end-card-celebration ${easterEggActive ? "easter-egg-party" : ""}`}>
      <div
        className="end-mascot-wrapper"
        onClick={handleMascotClick}
        title="Clique-moi 3 fois !"
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        <span className="end-mascot-bounce">{mascot}</span>
        {easterEggActive && <span className="easter-tag">✨ MODE SECRET DÉVERROUILLÉ ! ✨</span>}
      </div>

      <div className="end-confetti-container" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className={`confetti-item piece-${i % 6}`} />
        ))}
      </div>

      <p className="bubble center outro-text">
        {message}
      </p>

      {easterEggActive && (
        <div className="easter-egg-banner">
          🎉 🌊 <strong>Félicitations !</strong> Tu as trouvé le trésor secret du capitaine ! Prépare-toi pour une escale inoubliable ! 💖 ✨
        </div>
      )}
    </div>
  );
}
