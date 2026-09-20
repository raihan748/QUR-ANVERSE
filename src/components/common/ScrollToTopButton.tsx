import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { NavigationTab } from '../../types';

interface ScrollToTopButtonProps {
  onSelectTab?: (tab: NavigationTab) => void;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-36 lg:bottom-22 right-4 z-40 flex flex-col items-end gap-2 transition-all">
      <button
        onClick={scrollToTop}
        className="w-11 h-11 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-600/50 flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        title="Kembali ke Atas"
      >
        <ArrowUp className="w-5 h-5 font-bold" />
      </button>
    </div>
  );
};
