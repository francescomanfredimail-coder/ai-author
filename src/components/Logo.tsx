'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
  textColor?: string;
}

export function Logo({ 
  size = 'md', 
  showText = true, 
  animated = true,
  textColor 
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex items-center gap-3">
      <div 
        className={sizeClasses[size]}
        style={{ 
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          animation: animated ? 'bounce 2s infinite' : 'none',
        }}
      >
        🦙
      </div>
      {showText && (
        <h1 
          className={`font-bold ${textSizeClasses[size]}`}
          style={{ 
            color: textColor || 'var(--accent)', 
            fontFamily: 'Georgia, serif' 
          }}
        >
          Lama Bollente
        </h1>
      )}
    </div>
  );
}

