// GraphIT_app/frontend/src/components/GlassyCard.js

import React from 'react';

function GlassyCard({ children, className = '' }) {
  return (
    <div
      className={`
        // Základní "skleněné" styly
        bg-text-graphit-white/10    // 1. Pozadí: Průhledná bílá (10% opacita). Používá vaši definovanou bílou barvu.
        backdrop-blur-md            // 2. Rozmazání pozadí: Toto je klíč k "skleněnému" efektu. Střední rozmazání.
        border border-text-graphit-white/20 // 3. Okraj: Jemný bílý okraj (20% opacita) pro definování tvaru.
        rounded-lg                  // 4. Zaoblené rohy: Středně zaoblené rohy pro měkčí vzhled.
        shadow-lg                   // 5. Stín: Velký stín pod prvkem pro dodání hloubky a oddělení.

        // Základní styly obsahu uvnitř karty
        p-6                         // Vnitřní odsazení: Aby obsah nebyl nalepený na okrajích.
        text-text-graphit-white     // Výchozí barva textu: Pro text uvnitř GlassyCard, pokud není přepsána.

        ${className}                // Umožňuje přidat nebo přepsat vlastní Tailwind třídy z rodičovské komponenty.
      `}
    >
      {children} {/* Zde se vykreslí jakýkoli obsah, který obalíte GlassyCard */}
    </div>
  );
}

export default GlassyCard;