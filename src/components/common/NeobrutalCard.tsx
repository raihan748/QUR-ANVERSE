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
        return 'bg-[#0B4627] text-white border border-emerald-800 shadow-sm';
      case 'gold':
        return 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 border border-amber-400 shadow-sm';
      case 'dark':
        return 'bg-slate-900 text-slate-50 border border-slate-800 shadow-sm';
      case 'sepia':
        return 'bg-[#FFFDF9] text-slate-900 border border-amber-200/80 shadow-xs';
      case 'white':
      default:
        return 'bg-white text-slate-900 border border-slate-200/90 shadow-xs';
    }
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:border-slate-300 hover:shadow-md active:translate-y-0.5 transition duration-150 ease-out'
    : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 sm:p-5 relative ${getVariantStyles()} ${interactiveStyles} ${className}`}
    >
      {children}
    </div>
  );
};
