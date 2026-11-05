import React from 'react';
import { Feather, BookOpen, Sparkles, FolderArchive, MessageSquareHeart, Sliders } from 'lucide-react';

interface HeaderProps {
  activeTab: 'ghostwriter' | 'compose' | 'presets' | 'excuses' | 'dossier';
  setActiveTab: (tab: 'ghostwriter' | 'compose' | 'presets' | 'excuses' | 'dossier') => void;
  savedCount: number;
  onNewEpistle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onNewEpistle,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#faf8f5]/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('ghostwriter');
          }}
          className="text-xl sm:text-2xl font-serif-cormorant font-bold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0 flex items-center gap-2.5"
        >
          <span className="w-8 h-8 rounded-full bg-amber-900/10 dark:bg-amber-100/10 flex items-center justify-center text-amber-800 dark:text-amber-200 font-serif-cormorant text-lg italic border border-amber-900/20 dark:border-amber-100/20">
            H
          </span>
          <span>Humorous Apology Ghostwriter</span>
        </a>

        {/* Zone 2: 4-5 clean single-line nav links with hover underlines */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-300">
          <button
            onClick={() => setActiveTab('ghostwriter')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 ${
              activeTab === 'ghostwriter'
                ? 'text-amber-900 dark:text-amber-300 font-semibold border-b-2 border-amber-800 dark:border-amber-400 pb-0.5'
                : ''
            }`}
          >
            <MessageSquareHeart className="w-4 h-4 opacity-80" />
            <span>Ghostwriter Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('compose')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 ${
              activeTab === 'compose'
                ? 'text-amber-900 dark:text-amber-300 font-semibold border-b-2 border-amber-800 dark:border-amber-400 pb-0.5'
                : ''
            }`}
          >
            <Sliders className="w-4 h-4 opacity-80" />
            <span>Classic Composer</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'text-amber-900 dark:text-amber-300 font-semibold border-b-2 border-amber-800 dark:border-amber-400 pb-0.5'
                : ''
            }`}
          >
            <BookOpen className="w-4 h-4 opacity-80" />
            <span>Hall of Infamy</span>
          </button>

          <button
            onClick={() => setActiveTab('excuses')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 ${
              activeTab === 'excuses'
                ? 'text-amber-900 dark:text-amber-300 font-semibold border-b-2 border-amber-800 dark:border-amber-400 pb-0.5'
                : ''
            }`}
          >
            <Sparkles className="w-4 h-4 opacity-80" />
            <span>Excuse Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 ${
              activeTab === 'dossier'
                ? 'text-amber-900 dark:text-amber-300 font-semibold border-b-2 border-amber-800 dark:border-amber-400 pb-0.5'
                : ''
            }`}
          >
            <FolderArchive className="w-4 h-4 opacity-80" />
            <span>Saved Dossier</span>
            {savedCount > 0 && (
              <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                ({savedCount})
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNewEpistle}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-100 bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-1.5"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>New Letter</span>
          </button>
        </div>
      </div>
    </header>
  );
};
