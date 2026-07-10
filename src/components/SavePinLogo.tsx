import React from "react";

interface SavePinLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "custom";
}

export default function SavePinLogo({ className = "", size = "md" }: SavePinLogoProps) {
  let sizeClass = "w-16 h-18";
  if (size === "sm") sizeClass = "w-7 h-8";
  if (size === "md") sizeClass = "w-16 h-18";
  if (size === "lg") sizeClass = "w-24 h-26";
  if (size === "xl") sizeClass = "w-32 h-36";
  if (size === "custom") sizeClass = "";

  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${sizeClass} ${className}`}>
      <svg
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(127,163,150,0.15)]"
      >
        {/* Decorative background glow for extra elegance */}
        <circle cx="50" cy="50" r="42" fill="url(#glowGradient)" opacity="0.4" />

        {/* Pin Point / Ribbon Tail (pointing downward at the bottom) */}
        <g id="pin-tail">
          {/* Main Dark Green Back Ribbon Tail */}
          <path
            d="M38 75 L50 102 L62 75 Z"
            fill="#34483D"
            stroke="#1B2620"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Accent Mint Green Front Ribbon Tail */}
          <path
            d="M44 75 L50 93 L56 75 Z"
            fill="#7FA396"
          />
        </g>

        {/* Head Antenna Structure */}
        <g id="antenna">
          {/* Metal Antenna Shaft */}
          <rect x="48" y="4" width="4" height="22" rx="2" fill="#5C7C6F" />
          <rect x="49.5" y="6" width="1" height="18" fill="#7FA396" opacity="0.5" />
          {/* Glowing Top Sphere */}
          <circle cx="50" cy="5" r="5" fill="#7FA396" />
          <circle cx="50" cy="5" r="5" fill="#FFFFFF" opacity="0.6" className="animate-pulse" />
        </g>

        {/* Head Body Outline */}
        <circle cx="50" cy="50" r="32" fill="#1B2620" />
        
        {/* Head Inner Face Circle (light mint/teal sage green background) */}
        <circle cx="50" cy="50" r="30" fill="#D5E6E0" />
        
        {/* Gentle Face Gloss Reflection Layer */}
        <path
          d="M22 40 C25 28, 35 21, 50 20 C65 19, 75 27, 78 38 C70 28, 55 24, 22 40 Z"
          fill="#FFFFFF"
          opacity="0.35"
        />

        {/* Cute Mascot Eyes */}
        <g id="eyes">
          {/* Left Eye */}
          <circle cx="37" cy="46" r="7.5" fill="#121A16" />
          {/* Left Eye Twinkles */}
          <circle cx="34.5" cy="43.5" r="2.5" fill="#FFFFFF" />
          <circle cx="38.5" cy="48" r="1" fill="#FFFFFF" />

          {/* Right Eye */}
          <circle cx="63" cy="46" r="7.5" fill="#121A16" />
          {/* Right Eye Twinkles */}
          <circle cx="60.5" cy="43.5" r="2.5" fill="#FFFFFF" />
          <circle cx="64.5" cy="48" r="1" fill="#FFFFFF" />
        </g>

        {/* Rosy Soft Pink Blush Cheeks */}
        <g id="cheeks" opacity="0.65">
          <circle cx="27" cy="54" r="4.5" fill="#E89696" />
          <circle cx="73" cy="54" r="4.5" fill="#E89696" />
        </g>

        {/* Friendly Mouth Smile */}
        <path
          d="M42 56 C42 56, 50 63, 58 56"
          stroke="#121A16"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        <defs>
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7FA396" />
            <stop offset="100%" stopColor="#7FA396" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
