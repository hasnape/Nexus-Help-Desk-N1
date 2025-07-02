import React from 'react';

interface NexusLogoProps {
  className?: string;
}

const NexusLogo: React.FC<NexusLogoProps> = ({ className }) => {
  // ...component code, apply className to
  return <div className={className}>NexusLogo</div>;
};

export default NexusLogo;

interface FooterProps {
  t: (key: string) => string;
}

export const Footer: React.FC<FooterProps> = ({ t }) => {
  return (
    <div className="flex items-center mb-4">
      <NexusLogo className="w-10 h-10 mr-3 text-primary" />
      <h3 className="text-xl font-bold">{t('appName')}</h3>
    </div>
  );
};