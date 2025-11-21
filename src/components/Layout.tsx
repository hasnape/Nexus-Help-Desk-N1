import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  includeFooter?: boolean;
  mainClassName?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className = '',
  includeFooter = true,
  mainClassName = ''
}) => {
  const { t } = useLanguage();

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {/* Lien d’accessibilité */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-black focus:text-white focus:px-3 focus:py-2 rounded"
      >
        {t('accessibility.skipToContent', { defaultValue: 'Aller au contenu' })}
      </a>

      {/* En-tête avec Navbar */}
      <header role="banner">
        <Navbar />
      </header>

      {/* Contenu principal */}
      <main
        id="main-content"
        role="main"
        className={`flex-1 ${mainClassName}`}
      >
        {children}
      </main>

      {/* Pied de page conditionnel */}
      {includeFooter && (
        <footer role="contentinfo">
          <Footer />
        </footer>
      )}
    </div>
  );
};

export default Layout;
