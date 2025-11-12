import React from 'react';
import { Link } from 'react-router-dom';

interface FloatingActionButtonProps {
  to: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const DefaultIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
);

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ to, title, icon, className }) => {
  return (
    <Link
      to={to}
      className={`fixed bottom-6 end-6 inline-flex items-center rounded-full bg-sky-600 px-5 py-3 text-white shadow-lg transition-transform hover:bg-sky-700 hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 ${className ?? ''}`}
      title={typeof title === 'string' ? title : undefined}
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <span className="me-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
        {icon ?? <DefaultIcon className="h-5 w-5" />}
      </span>
      <span className="font-semibold text-sm">{title}</span>
    </Link>
  );
};

export default FloatingActionButton;
