import React from 'react';
import './button.css';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary'|'secondary'|'ghost'|'ia';
  children: React.ReactNode;
};

export const Button: React.FC<Props> = ({ variant = 'primary', children, ...rest }) => {
  const cls = `nexus-btn nexus-btn--${variant}`;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
};

export default Button;
