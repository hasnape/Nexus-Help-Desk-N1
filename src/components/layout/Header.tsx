import React from 'react';
import './header.css';

export const Header: React.FC = () => {
  return (
    <header className="nexus-header">
      <div className="container nexus-header__inner">
        <div className="brand">
          <div className="brand__logo">N</div>
          <span className="brand__title">Nexus Help Desk</span>
        </div>
        <nav className="nexus-nav">
          <a href="/">Home</a>
          <a href="/tickets">Tickets</a>
          <a href="/help">Help</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
