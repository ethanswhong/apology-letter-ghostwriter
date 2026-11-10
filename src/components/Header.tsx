import React, { useState } from 'react';
import { Menu, X, Feather } from 'lucide-react';
type Tab = 'ghostwriter' | 'compose' | 'presets' | 'excuses' | 'dossier';
interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  savedCount: number;
  onNewEpistle: () => void;
}
export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onNewEpistle,
}) => {
  const [open, setOpen] = useState(false);
  const links: [Tab, string][] = [
    ['ghostwriter', 'Write a letter'],
    ['compose', 'Classic Composer'],
    ['presets', 'Examples'],
    ['excuses', 'Excuse Lab'],
    ['dossier', `Saved letters (${savedCount})`],
  ];
  const navigate = (tab: Tab) => {
    setActiveTab(tab);
    setOpen(false);
    window.scrollTo({ top: 0 });
  };
  return (
    <header className="no-print sticky top-0 z-30 bg-[#faf8f5]/95 border-b border-stone-200 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-16 flex items-center justify-between gap-3">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            navigate('ghostwriter');
          }}
          className="font-serif-cormorant font-bold text-xl sm:text-2xl min-w-0"
        >
          Letter Studio
        </a>
        <nav aria-label="Main navigation" className="hidden xl:flex gap-2">
          {links.map(([tab, label]) => (
            <button
              key={tab}
              aria-current={activeTab === tab ? 'page' : undefined}
              onClick={() => navigate(tab)}
              className={`px-3 text-sm rounded-lg ${activeTab === tab ? 'bg-amber-100 text-amber-950 font-semibold' : 'text-stone-600'}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => {
              onNewEpistle();
              setOpen(false);
              window.scrollTo({ top: 0 });
            }}
            className="px-3 rounded-lg bg-stone-900 text-white text-sm flex items-center gap-2"
          >
            <Feather size={16} />
            New letter
          </button>
          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
            className="xl:hidden p-3 rounded-lg border border-stone-300"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="xl:hidden px-4 pb-4 grid gap-1"
        >
          {links.map(([tab, label]) => (
            <button
              key={tab}
              aria-current={activeTab === tab ? 'page' : undefined}
              onClick={() => navigate(tab)}
              className={`text-left px-4 rounded-lg ${activeTab === tab ? 'bg-amber-100 font-semibold' : ''}`}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};
