import React from 'react';
import { Link } from 'react-router-dom';

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);

interface FloatingActionButtonProps {
  to: string;
  title: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ to, title }) => {
  return (
    <Link
      to={to} // This will now correctly be "/help"
      title={title}
      className="fixed bottom-6 end-6 bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-all duration-200 ease-in-out z-50"
      aria-label={title}
    >
      <PlusIcon className="w-8 h-8" />
    </Link>
  );
};

export default FloatingActionButton;