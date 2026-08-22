import React from 'react';

interface NeobrutalCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'emerald' | 'gold' | 'white' | 'dark' | 'sepia';
  interactive?: boolean;
  onClick?: () => void;
}

export const NeobrutalCard: React.FC<NeobrutalCardProps> = ({
  children,
  className = '',
  variant = 'white',
  interactive = false,
  onClick
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return 'bg-[#0B4627] text-white border-2 border-black shadow-[4px_4px_0px_0px_#111827]';
      case 'gold':
        return 'bg-[#F59E0B] text-black border-2 border-black shadow-[4px_4px_0px_0px_#111827]';
      case 'dark':
        return 'bg-[#111827] text-[#F9FAFB] border-2 border-[#F59E0B] shadow-[4px_4px_0px_0px_#0B4627]';
      case 'sepia':
        return 'bg-[#FFFDF7] text-[#111827] border-2 border-black shadow-[4px_4px_0px_0px_#D97706]';
      case 'white':
      default:
        return 'bg-white text-[#111827] border-2 border-black shadow-[4px_4px_0px_0px_#111827]';
    }
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[6px_6px_0px_0px_#111827] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_#111827] transition-all'
    : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 sm:p-5 relative ${getVariantStyles()} ${interactiveStyles} ${className}`}
    >
      {children}
    </div>
  );
};
