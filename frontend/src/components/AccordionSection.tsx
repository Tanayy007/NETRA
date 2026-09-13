"use client";
import { useState } from "react";

interface AccordionItem {
  id: string;
  label: string;       // e.g. "01 · Early Susceptibility"
  title: string;       // e.g. "PREDICT"
  icon: string;        // material-symbols name
  accentColor: string; // Tailwind color class: "amber" | "sky" | "emerald" | "rose"
  summary: string;     // short text shown in collapsed state
  details: string[];   // bullet points shown when expanded
  footer?: string;
}

interface AccordionSectionProps {
  items: AccordionItem[];
  cols?: number;
}

const COLOR_MAP: Record<string, { border: string; text: string; bg: string; badge: string }> = {
  amber:   { border: "border-amber-500/70",   text: "text-amber-400",   bg: "bg-amber-950/30",   badge: "bg-amber-500" },
  sky:     { border: "border-sky-500/70",     text: "text-sky-400",     bg: "bg-sky-950/30",     badge: "bg-sky-500" },
  emerald: { border: "border-emerald-500/70", text: "text-emerald-400", bg: "bg-emerald-950/30", badge: "bg-emerald-500" },
  rose:    { border: "border-rose-500/70",    text: "text-rose-400",    bg: "bg-rose-950/30",    badge: "bg-rose-500" },
  slate:   { border: "border-slate-600",      text: "text-slate-300",   bg: "bg-slate-800/30",   badge: "bg-slate-500" },
};

export default function AccordionSection({ items, cols = 4 }: AccordionSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  const gridClass =
    cols === 6 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6" :
    cols === 5 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5" :
    "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        const c = COLOR_MAP[item.accentColor] ?? COLOR_MAP.slate;

        return (
          <div
            key={item.id}
            onClick={() => toggle(item.id)}
            className={`
              relative bg-[#0b192c] rounded-xl border cursor-pointer
              transition-all duration-300 flex flex-col
              ${isOpen ? `${c.border} shadow-lg` : "border-slate-800 hover:border-slate-700"}
            `}
          >
            {/* Header — always visible */}
            <div className="p-6">
              <div className={`w-11 h-11 rounded-lg ${c.bg} border ${isOpen ? c.border : "border-slate-700/50"} flex items-center justify-center ${c.text} mb-4 transition-colors`}>
                <span className="material-symbols-outlined text-[26px]">{item.icon}</span>
              </div>
              <span className={`text-[10px] font-mono font-semibold ${c.text} uppercase tracking-wider`}>
                {item.label}
              </span>
              <h3 className="text-lg font-bold text-white mt-1 mb-2">{item.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{item.summary}</p>
            </div>

            {/* Expand/Collapse indicator */}
            <div className={`mx-6 mb-4 flex items-center gap-2 text-[10px] font-mono ${c.text} transition-all`}>
              <span className={`w-1.5 h-1.5 rounded-full ${c.badge} ${isOpen ? "animate-pulse" : ""}`}></span>
              <span>{isOpen ? "COLLAPSE ▲" : "VIEW DETAILS ▼"}</span>
            </div>

            {/* Expanded content — slides open */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div className={`mx-4 mb-4 p-4 rounded-lg border ${c.border} ${c.bg}`}>
                <ul className="space-y-2">
                  {item.details.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                      <span className={`mt-0.5 w-1.5 h-1.5 rounded-full ${c.badge} shrink-0`}></span>
                      {point}
                    </li>
                  ))}
                </ul>
                {item.footer && (
                  <div className={`mt-3 pt-3 border-t border-slate-700/50 text-[10px] font-mono ${c.text} font-semibold`}>
                    {item.footer}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
