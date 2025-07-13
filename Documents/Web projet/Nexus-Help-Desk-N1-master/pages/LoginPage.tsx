

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import { Button, Input } from '../components/FormElements';
import { useLanguage } from '../contexts/LanguageContext';
import { UserRole } from '../types';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === '' || password === '' || companyName.trim() === '') {
      setError(t('login.error.allFieldsRequired'));
      return;
    }

    setIsLoading(true);
    setError('');
    const loginResult = await login(email.trim(), password, companyName.trim());
    
    setIsLoading(false);
    if (loginResult !== true) {
      setError(loginResult);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-primary mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
          </svg>
          <h1 className="text-3xl font-bold text-textPrimary">{t('login.title')}</h1>
          <p className="text-textSecondary mt-1">{t('login.subtitleSimple')}</p>
        </div>

        <div className="mb-6 text-sm bg-primary/5 border border-primary/20 text-slate-700 p-4 rounded-lg text-center">
            <p>{t('login.appDescription')}</p>
        </div>
        
        {error && <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded-md text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t('login.emailLabel')}
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('login.emailPlaceholder')}
            autoFocus
            required
            disabled={isLoading}
          />
          <Input
            label={t('login.passwordLabel')}
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('login.passwordPlaceholder')}
            required
            disabled={isLoading}
          />
          <Input
            label={t('login.companyNameLabel', {default: "Company Name"})}
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={t('login.companyNamePlaceholder', {default: "Enter your company's name"})}
            required
            disabled={isLoading}
          />
          <Button type="submit" className="w-full !mt-8" size="lg" isLoading={isLoading} disabled={isLoading}>
            {t('login.signInButton')}
          </Button>
        </form>
        <p className="mt-6 text-sm text-center text-slate-500">
          {t('login.noAccount')}{' '}
          <Link to="/signup" className="font-medium text-primary hover:text-primary-dark">
            {t('login.signUpLink')}
          </Link>
        </p>

        <div className="mt-4 text-center">
            <Link to="/landing" className="font-bold text-slate-600 hover:text-primary transition-colors text-sm">
                &larr; {t('signup.backToHome', {default: "Back to Home"})}
            </Link>
        </div>

         <p className="mt-4 text-xs text-center text-slate-400">
          {t('login.demoNotes.supabase.production')}
        </p>
        <footer className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} {t('appName')}. {t('footer.allRightsReserved', { default: 'All Rights Reserved.' })}</p>
            <p className="mt-1">
                <Link to="/legal" className="hover:text-primary hover:underline">{t('footer.legalLink', { default: 'Legal & Documentation' })}</Link>
                <span className="mx-2 text-slate-400">|</span>
                <Link to="/manual" className="hover:text-primary hover:underline">{t('footer.userManualLink', { default: 'User Manual' })}</Link>
                <span className="mx-2 text-slate-400">|</span>
                <Link to="/presentation" className="hover:text-primary hover:underline">{t('footer.promotionalLink', { default: 'Presentation' })}</Link>
            </p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;