import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import VideoPlayer from '../components/VideoPlayer';
import { useTranslation } from 'react-i18next';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' {...props}>
    <path
      fillRule='evenodd'
      d='M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z'
      clipRule='evenodd'
    />
  </svg>
);

const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' {...props}>
    <path d='M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z' />
    <path d='M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z' />
  </svg>
);

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useApp();
  const location = useLocation();

  const backLinkDestination = user ? '/dashboard' : '/landing';
  const backLinkText = user
    ? t('subscription.backToDashboard', { defaultValue: 'Back to Dashboard' })
    : t('contact.backToHome', { defaultValue: 'Back to Home' });

  return (
    <div className='page-container section-stack'>
      <div>
        <Link to={backLinkDestination} state={{ from: location }} className='pill-link'>
          <ArrowLeftIcon className='w-5 h-5' />
            {backLinkText}
          </Link>
        </div>

        <header className='space-y-3'>
          <span className='section-eyebrow'>{t('contact.badge')}</span>
          <div className='space-y-2'>
            <h1 className='section-title'>{t('contact.pageTitle', { defaultValue: 'Contact Us' })}</h1>
            <p className='section-subtitle max-w-2xl'>{t('contact.subtitle')}</p>
          </div>
        </header>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr,0.9fr]'>
          <section className='surface-card p-6 lg:p-8 space-y-5'>
            <div className='flex items-center gap-3'>
              <div className='bg-primary/20 text-primary w-12 h-12 flex items-center justify-center rounded-full'>
                <MailIcon className='w-7 h-7' />
              </div>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-300'>{t('contact.tagline')}</p>
                <h2 className='text-xl font-semibold text-white'>{t('contact.sectionTitle')}</h2>
              </div>
            </div>
            <p className='muted-copy'>{t('contact.body')}</p>
            <div className='surface-card-soft p-4 space-y-2'>
              <p className='text-sm text-slate-200'>{t('contact.email.label')}</p>
              <a href={`mailto:${t('contact.email.address')}`} className='text-lg font-semibold text-primary hover:text-primary-light break-all'>
                {t('contact.email.address')}
              </a>
            </div>
            <div className='flex items-center gap-3 pt-2'>
              <img
                src='https://yt3.ggpht.com/vbfaZncvDLBv7B4Xo9mFggNozPaGAaGMkwciDaL-UtdLClEQmWB5blCibQacHzdrI1RL_5C9_g=s108-c-k-c0x00ffffff-no-rj'
                alt='Nexus Support Hub Logo'
                className='w-12 h-12 rounded-full object-cover border border-slate-800'
                loading='lazy'
                width={48}
                height={48}
              />
              <div>
                <p className='text-sm font-semibold text-white'>{t('appName')}</p>
                <p className='text-xs text-slate-400'>REP&WEB</p>
              </div>
            </div>
          </section>

          <section className='surface-card p-6 lg:p-8 space-y-5'>
            <div className='space-y-1 text-center'>
              <h2 className='text-xl font-semibold text-white'>{t('contact.video.title')}</h2>
              <p className='muted-copy'>{t('contact.video.subtitle')}</p>
            </div>
            <div className='overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80'>
              <div
                style={{
                  position: 'relative',
                  paddingBottom: '56.25%',
                  height: 0,
                }}
              >
                <iframe
                  src='https://www.youtube.com/embed/OnfUuaRlukQ'
                  title='Nexus Support Hub Demo'
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                  loading='lazy'
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                ></iframe>
              </div>
            </div>
            <div className='text-center'>
              <VideoPlayer
                buttonText={t('contact.video.watchFull', {
                  defaultValue: 'Voir la présentation complète',
                })}
                className='text-sm'
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
