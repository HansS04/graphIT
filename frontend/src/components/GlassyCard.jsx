import React from 'react';

// Znovupoužitelná UI komponenta sloužící jako vizuální kontejner s efektem mléčného skla.
// Parametr 'children' slouží pro vnořený obsah, 'className' umožňuje přidání dodatečných stylů.
function GlassyCard({ children, className = '' }) {
  return (
    <div
      // Aplikace Tailwind utility tříd. Zajišťují poloprůhledné pozadí, plošné rozostření (blur),
      // zaoblení hran a definici vnitřního odsazení.
      className={`
        bg-text-graphit-white/10
        backdrop-blur-md
        border border-text-graphit-white
        rounded-lg
        shadow-lg
        p-6
        text-text-graphit-white
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default GlassyCard;