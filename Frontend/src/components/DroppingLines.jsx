import React, { useEffect, useState, useRef } from 'react';

const Meteor = ({ delay, left }) => {
  const [phase, setPhase] = useState("idle"); 
  
  useEffect(() => {
    let timeoutId;
    const dropDuration = 4000; // Slower drop (4 seconds)
    const splashDuration = 800;
    
    const loop = () => {
      setPhase("falling");
      timeoutId = setTimeout(() => {
        setPhase("splashing");
        timeoutId = setTimeout(() => {
          setPhase("idle");
          timeoutId = setTimeout(loop, Math.random() * 4000 + 2000); // Longer wait between drops
        }, splashDuration);
      }, dropDuration);
    };
    
    timeoutId = setTimeout(loop, delay);
    return () => clearTimeout(timeoutId);
  }, [delay]);

  const particles = useRef(
    Array.from({ length: 15 }).map(() => ({
      x: Math.floor((Math.random() - 0.5) * 100),
      y: Math.floor((Math.random() - 0.5) * 100) - 20, // slightly upward splash
    }))
  ).current;

  if (phase === "idle") return null;

  return (
    <div className="absolute z-0 w-px" style={{ left, top: 0, bottom: 0 }}>
      {phase === "falling" && (
        <div 
          className="absolute left-0 w-[2px] rounded-full bg-gradient-to-t from-[oklch(61%_0.09_60.8)] via-[oklch(61%_0.09_60.8)]/80 to-transparent"
          style={{
            height: "40px", // Much smaller lines
            animation: "meteor-fall 4s linear forwards", // Much slower animation
          }}
        />
      )}
      
      {phase === "splashing" && (
        <div className="absolute w-2 h-2 z-50" style={{ bottom: 0, left: "50%", transform: "translate(-50%, 50%)" }}>
          {/* Central glow */}
          <div className="absolute -inset-x-10 top-0 m-auto h-2 w-10 rounded-full bg-gradient-to-r from-transparent via-[oklch(61%_0.09_60.8)] to-transparent blur-sm animate-pulse-fade" />
          {/* Splashing particles */}
          {particles.map((p, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-[oklch(61%_0.09_60.8)]"
              style={{
                '--tx': `${p.x}px`,
                '--ty': `${p.y}px`,
                animation: "meteor-splash 0.8s cubic-bezier(0.1, 0.9, 0.2, 1) forwards",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function DroppingLines() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Glowing Horizon Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[oklch(61%_0.09_60.8)]/30 to-transparent" />
      <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-[oklch(61%_0.09_60.8)]/20 blur-[50px] rounded-full pointer-events-none" />
      
      {/* Meteors hitting the bottom line */}
      <Meteor left="15%" delay={0} />
      <Meteor left="35%" delay={1200} />
      <Meteor left="60%" delay={400} />
      <Meteor left="80%" delay={2000} />
      <Meteor left="90%" delay={800} />
      <Meteor left="25%" delay={2500} />
      <Meteor left="50%" delay={1800} />
    </div>
  );
}
