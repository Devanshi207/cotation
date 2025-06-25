// src/components/DashboardCard.jsx
import React from "react";

const DashboardCard = ({ title, value, subtitle, gradient, waveColor = "#ffffff" }) => {
  // Inject chosen wave color into data‑URI
  const encodedWave = encodeURIComponent(
    `<svg viewBox='0 0 1440 320' xmlns='http://www.w3.org/2000/svg'>
       <path d='M0,224L60,197.3C120,171,240,117,360,117.3C480,117,600,171,720,176C840,181,960,139,1080,138.7C1200,139,1320,181,1380,202.7L1440,224L1440,320L0,320Z' fill='${waveColor}'/>
     </svg>`
  );

  return (
    <div
      className="relative overflow-hidden rounded-lg p-6 text-white"
      style={{ background: gradient }}
    >
      {/* diagonal band */}
      <div
        className="absolute inset-0 w-[200%] diagonal-wave"
        style={{
          top: "-90%",
          height: "300%",
          transform: "rotate(-15deg)",
          transformOrigin: "center",
          backgroundImage: `url("data:image/svg+xml,${encodedWave}")`,
        }}
      />

      {/* foreground text */}
      <div className="relative z-10 space-y-1">
        <h3 className="text-lg">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm">{subtitle}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
