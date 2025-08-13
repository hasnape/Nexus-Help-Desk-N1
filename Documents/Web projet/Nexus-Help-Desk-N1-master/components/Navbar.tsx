
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Button } from './FormElements';
import { useLanguage, Locale } from '../contexts/LanguageContext';
import { UserRole } from '../types'; 
import AgentIcon from './AgentIcon'; 
import ManagerIcon from './ManagerIcon';

const SpeakerLoudIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M10 3a.75.75 0 01.75.75v12.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110 3zM6.5 5.05A.75.75 0 005 5.801v8.397a.75.75 0 001.5.652V5.802a.75.75 0 00-.75-.752zM13.5 5.05a.75.75 0 00-.75.752v8.397a.75.75 0 001.5.652V5.802a.75.75 0 00-.75-.752zM2.75 7.5a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5zM17.25 7.5a.75.75 0 00-1.5 0v5a.75.75 0 001.5 0v-5z" />
  </svg>
);

const SpeakerOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M13.28 6.72a.75.75 0 00-1.06-1.06L10 7.94 7.78 5.66a.75.75 0 00-1.06 1.06L8.94 9l-2.22 2.22a.75.75 0 101.06 1.06L10 10.06l2.22 2.22a.75.75 0 101.06-1.06L11.06 9l2.22-2.28z" />
    <path fillRule="evenodd" d="M10 1a9 9 0 100 18 9 9 0 000-18zM2.5 10a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z" clipRule="evenodd" />
  </svg>
);

const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.134-.662 1.456 0l1.861 3.832 4.232.616c.732.106 1.026.996.495 1.503l-3.063 2.985.722 4.214c.124.727-.639 1.282-1.29.95l-3.78-1.987-3.78 1.987c-.651.332-1.414-.223-1.29-.95l.722-4.214-3.063-2.985c-.531-.507-.237-1.397.495-1.503l4.232-.616 1.86-3.832z" clipRule="evenodd" />
  </svg>
);

const Navbar: React.FC = () => {
  const { user, logout, isAutoReadEnabled, toggleAutoRead } = useApp();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };

  const languages: { code: Locale; nameKey: string; defaultName: string }[] = [
    { code: 'en', nameKey: 'language.english', defaultName: 'English' },
    { code: 'fr', nameKey: 'language.french', defaultName: 'Français' },
    { code: 'ar', nameKey: 'language.arabic', defaultName: 'العربية' },
  ];

  return (
    <nav className="bg-slate-800 text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/landing"} className="text-2xl font-bold text-sky-400 hover:text-sky-300">
              {t('appName')}
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-1">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  variant="outline"
                  size="sm"
                  className={`!py-1 !px-2 !text-xs ${
                    language === lang.code 
                      ? '!bg-sky-500 !text-white !border-sky-500' 
                      : '!text-slate-300 !border-slate-600 hover:!bg-slate-700 hover:!text-white'
                  }`}
                >
                  {t(lang.nameKey, { default: lang.defaultName })}
                </Button>
              ))}
            </div>

            {user ? (
              <>
                {user.role === UserRole.MANAGER && (
                    <Link to="/subscribe">
                        <Button variant="outline" size="sm" className="!text-yellow-300 !border-yellow-500 hover:!bg-yellow-600">
                            <StarIcon className="w-4 h-4 me-1 sm:me-1.5"/>
                            {t('navbar.subscriptionButton', { default: 'Subscription'})}
                        </Button>
                    </Link>
                )}
                {user.role === UserRole.AGENT && (
                  <Link to="/agent/dashboard">
                    <Button variant="outline" size="sm" className="!text-sky-300 !border-sky-500 hover:!bg-sky-700">
                      <AgentIcon className="w-4 h-4 me-1 sm:me-1.5"/> 
                      {t('navbar.agentPortalButton', { default: 'Agent Portal'})}
                    </Button>
                  </Link>
                )}
                {user.role === UserRole.MANAGER && (
                   <Link to="/manager/dashboard">
                    <Button variant="outline" size="sm" className="!text-emerald-300 !border-emerald-500 hover:!bg-emerald-700">
                       <ManagerIcon className="w-4 h-4 me-1 sm:me-1.5"/>
                      {t('navbar.managerPortalButton', { default: 'Manager Portal'})}
                    </Button>
                  </Link>
                )}

                <Button
                  onClick={toggleAutoRead}
                  variant="outline"
                  size="sm"
                  className="!p-1.5 sm:!p-2 !border-slate-500 hover:!bg-slate-700 focus:!ring-sky-500"
                  title={isAutoReadEnabled ? t('navbar.toggleAutoReadDisable') : t('navbar.toggleAutoReadEnable')}
                >
                  {isAutoReadEnabled ? (
                    <SpeakerLoudIcon className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
                  ) : (
                    <SpeakerOffIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  )}
                </Button>
                <div className="flex items-center text-slate-300 text-sm">
                  <span className="hidden sm:inline">
                    {t('navbar.welcome', { username: user.full_name })} ({t(`userRoleShort.${user.role}`, {default: user.role})})
                  </span>
                   <span className="sm:hidden">{user.full_name.substring(0,1).toUpperCase()} ({t(`userRoleShort.${user.role}`)})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium rounded-md transition duration-150 ease-in-out"
                >
                  {t('navbar.logoutButton')}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="!text-slate-200 !border-slate-500 hover:!bg-slate-700">
                    {t('navbar.loginButton', { default: 'Login' })}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm" className="!bg-sky-500 hover:!bg-sky-600">
                    {t('navbar.signUpButton', { default: 'Sign Up' })}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;