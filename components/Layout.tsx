import React from 'react';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  includeFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className = '', 
  includeFooter = true 
}) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <main className="flex-1">
        {children}
      </main>
      {includeFooter && <Footer />}
    </div>
  );
};

export default Layout;