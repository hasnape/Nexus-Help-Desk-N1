
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../App';
import { Button, Input, Select } from '../components/FormElements';
import { useLanguage, Locale } from '../contexts/LanguageContext';
import { UserRole } from '../types';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Locale>('en');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [secretCode, setSecretCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp, user } = useApp();
  const { t, language: currentAppLang } = useLanguage();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const languageOptions: { value: Locale; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'ar', label: 'العربية' },
  ];

  const roleOptions = [
    { value: UserRole.USER, label: t('userRole.user') },
    { value: UserRole.AGENT, label: t('userRole.agent') },
    { value: UserRole.MANAGER, label: t('userRole.manager') },
  ];

  useEffect(() => {
    setSelectedLanguage(currentAppLang);
  }, [currentAppLang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !password || !confirmPassword || !companyName.trim() || (role === UserRole.MANAGER && !secretCode.trim())) {
      setError(t('signup.error.allFieldsRequired'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('signup.error.passwordsDoNotMatch'));
      return;
    }
    if (password.length < 6) {
        setError(t('signup.error.minCharsPassword'));
        return;
    }
    if (role === UserRole.MANAGER && !secretCode.trim()) {
      setError(t('signup.error.secretCodeRequiredManager'));
      return;
    }

    setError('');
    setIsLoading(true);

    const result = await signUp(email.trim(), fullName.trim(), password, { 
      lang: selectedLanguage, 
      role: role,
      companyName: companyName.trim(),
      secretCode: role === UserRole.MANAGER ? secretCode.trim() : undefined,
    }); 

    setIsLoading(false);

    if (result !== true) {
      setError(result);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="bg-surface p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-primary mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.5A5.625 5.625 0 0 1 15.75 21H8.25A5.625 5.625 0 0 1 2.25 15.375V8.625c0-1.062.31-2.073.856-2.922m1.025-.975A3.75 3.75 0 0 0 6 5.25v1.5c0 .621.504 1.125 1.125 1.125H9" />
          </svg>
          <h1 className="text-3xl font-bold text-textPrimary">{t('signup.title')}</h1>
          <p className="text-textSecondary mt-1">{t('signup.subtitle')}</p>
        </div>
        
        {error && <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded-md">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={t('signup.emailLabel')}
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('signup.emailPlaceholder')}
            autoFocus
            required
            disabled={isLoading}
          />
           <Input
            label={t('signup.fullNameLabel')}
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t('signup.fullNamePlaceholder')}
            required
            disabled={isLoading}
          />
          <Input
            label={t('signup.passwordLabel')}
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('signup.passwordPlaceholder')}
            required
            disabled={isLoading}
          />
          <Input
            label={t('signup.confirmPasswordLabel')}
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('signup.confirmPasswordPlaceholder')}
            required
            disabled={isLoading}
          />

          <Select
            label={t('signup.roleLabel')}
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={roleOptions}
            required
            disabled={isLoading}
          />

          {role === UserRole.MANAGER && (
            <Input
              label={t('signup.secretCodeLabel')}
              id="secretCode"
              type="text"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder={t('signup.secretCodePlaceholderManager')}
              required
              disabled={isLoading}
            />
          )}

          <div>
            <Input
              label={role === UserRole.MANAGER ? t('signup.companyNameLabel') : t('signup.existingCompanyNameLabel')}
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={role === UserRole.MANAGER ? t('signup.companyNamePlaceholder') : t('signup.existingCompanyNamePlaceholder')}
              required
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-slate-500 px-1">
              {role === UserRole.MANAGER 
                ? t('signup.companyNameHelp.manager', { default: "This name must be unique. Your team will use it to sign up and log in."}) 
                : t('signup.companyNameHelp.employee', { default: "Enter the exact company name provided by your manager."})}
            </p>
          </div>


          <Select
            label={t('signup.languageLabel')}
            id="language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as Locale)}
            options={languageOptions.map(opt => ({...opt, label: t(`language.${opt.value}`, {default: opt.label})}))}
            required
            disabled={isLoading}
          />
          
          <Button type="submit" className="w-full !mt-8" size="lg" isLoading={isLoading} disabled={isLoading}>
            {t('signup.signUpButton')}
          </Button>
        </form>
        <div className="mt-6 text-sm text-center text-slate-500 space-y-2">
            <p>
              {t('signup.alreadyHaveAccount')}{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                {t('signup.signInLink')}
              </Link>
            </p>
            <p>
                <Link to="/landing" className="inline-flex items-center font-medium text-slate-600 hover:text-primary-dark">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 me-1">
                        <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                    </svg>
                    {t('signup.backToHome', { default: 'Back to Plans' })}
                </Link>
            </p>
        </div>
         <p className="mt-4 text-xs text-center text-slate-400">
          {t('login.demoNotes.supabase.production')}
          </p>
         <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <Link to="/legal" className="text-xs text-slate-500 hover:text-primary hover:underline">
                 {t('footer.legalLink', { default: 'Legal & Documentation' })}
            </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
