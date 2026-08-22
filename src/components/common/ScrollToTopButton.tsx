import React, { useState, useEffect } from 'react';
import { ArrowUp, Mic2, BookOpen, Compass } from 'lucide-react';
import { NavigationTab } from '../../types';

interface ScrollToTopButtonProps {
  onSelectTab: (tab: NavigationTab) => void;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ onSelectTab }) => {
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
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-40 flex flex-col items-end gap-2 animate-pop">
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="w-11 h-11 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-black border-2 border-black neo-button flex items-center justify-center cursor-pointer shadow-[3px_3px_0px_0px_#000]"
        title="Kembali ke Atas"
      >
        <ArrowUp className="w-5 h-5 font-black" />
      </button>
    </div>
  );
};
