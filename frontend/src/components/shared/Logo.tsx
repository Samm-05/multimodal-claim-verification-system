import React from 'react';
import { Shield } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  hideText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  iconClassName = '',
  textClassName = '',
  hideText = false,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 ${iconClassName}`}>
        <Shield className="w-5 h-5 text-on-primary fill-on-primary" />
      </div>
      {!hideText && (
        <div>
          <h1 className={`font-headline-md text-headline-md font-extrabold text-on-surface leading-none tracking-tight ${textClassName}`}>
            ClaimIQ AI
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mt-1">
            Enterprise Alpha
          </p>
        </div>
      )}
    </div>
  );
};
