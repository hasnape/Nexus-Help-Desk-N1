import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textOnly?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true,
  textOnly = false 
}) => {
  const sizeClasses = {
    sm: { img: 'w-8 h-8', text: 'text-xl' },
    md: { img: 'w-12 h-12', text: 'text-2xl' },
    lg: { img: 'w-16 h-16', text: 'text-3xl' },
    xl: { img: 'w-20 h-20', text: 'text-4xl' }
  };

  if (textOnly) {
    return (
      <span className={`font-bold text-blue-600 ${sizeClasses[size].text} ${className}`}>
        Nexus Support Hub
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <img 
        src="https://lh3.googleusercontent.com/a/ACg8ocLAm25UE8QHrZawg7e-s7IkDLECuEaCovfeTzwPrOcHOjGYLhQ=s288-c-no"
        alt="Nexus Support Hub Logo"
        className={`${sizeClasses[size].img} rounded-full object-cover shadow-lg`}
      />
      {showText && (
        <span className={`font-bold text-blue-600 ${sizeClasses[size].text}`}>
          Nexus Support Hub
        </span>
      )}
    </div>
  );
};

export default Logo;