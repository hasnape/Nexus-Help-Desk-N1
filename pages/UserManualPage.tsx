import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../App';
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

const UserManualPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useApp();
  const location = useLocation();

  const backLinkDestination = user ? '/dashboard' : '/landing';

  return (
    <div className='page-container section-stack'>
        <div>
          <Link to={backLinkDestination} state={{ from: location }} className='pill-link'>
            <ArrowLeftIcon className='w-5 h-5' />
            {t('userManual.backToApp', { defaultValue: 'Back to Application' })}
          </Link>
        </div>

        <header className='space-y-3'>
          <p className='section-eyebrow'>{t('userManual.badge')}</p>
          <h1 className='section-title'>{t('userManual.pageTitle', { defaultValue: 'User Manual' })}</h1>
          <p className='section-subtitle max-w-2xl'>{t('userManual.subtitle')}</p>
        </header>

        <div className='space-y-4'>
          <section className='surface-card p-5 lg:p-6 space-y-3'>
            <h2 className='text-lg font-semibold text-white'>
              {t('userManual.section.gettingStarted.title', { defaultValue: '1. Getting Started: Account Creation' })}
            </h2>
            <p className='muted-copy'>
              {t('userManual.section.gettingStarted.intro', {
                defaultValue: 'Welcome to Nexus Support Hub! Your role determines how you sign up and interact with the system.',
              })}
            </p>
            <div className='grid gap-4 lg:grid-cols-2'>
              <div className='surface-card-soft p-4 space-y-2'>
                <h3 className='text-sm font-semibold text-white'>
                  {t('userManual.section.gettingStarted.manager.title', {
                    defaultValue: 'For Managers: Creating a Company',
                  })}
                </h3>
                <ol className='list-decimal pl-5 space-y-1 text-sm text-slate-200'>
                  <li>{t('userManual.section.gettingStarted.manager.step1', { defaultValue: 'Navigate to the Sign Up page.' })}</li>
                  <li>
                    {t('userManual.section.gettingStarted.manager.step2', {
                      defaultValue: 'Select the "Manager" role from the dropdown.',
                    })}
                  </li>
                  <li>
                    {t('userManual.section.gettingStarted.manager.step3', {
                      defaultValue:
                        'A "Secret Code" field will appear. Enter the creation code `123456` to prove you are authorized to create a new company.',
                    })}
                  </li>
                  <li>
                    {t('userManual.section.gettingStarted.manager.step4', {
                      defaultValue: 'Enter your new, unique Company Name. This name is critical, as your team will use it to log in.',
                    })}
                  </li>
                  <li>
                    {t('userManual.section.gettingStarted.manager.step5', {
                      defaultValue: 'Complete the rest of the form and click "Sign Up".',
                    })}
                  </li>
                </ol>
              </div>

              <div className='surface-card-soft p-4 space-y-2'>
                <h3 className='text-sm font-semibold text-white'>
                  {t('userManual.section.gettingStarted.agentUser.title', {
                    defaultValue: 'For Agents & Users: Joining a Company',
                  })}
                </h3>
                <ol className='list-decimal pl-5 space-y-1 text-sm text-slate-200'>
                  <li>{t('userManual.section.gettingStarted.agentUser.step1', { defaultValue: 'Navigate to the Sign Up page.' })}</li>
                  <li>
                    {t('userManual.section.gettingStarted.agentUser.step2', {
                      defaultValue: 'Select your role ("Agent" or "User").',
                    })}
                  </li>
                  <li>
                    {t('userManual.section.gettingStarted.agentUser.step3', {
                      defaultValue: 'In the "Existing Company Name" field, enter the exact company name provided by your manager.',
                    })}
                  </li>
                  <li>
                    {t('userManual.section.gettingStarted.agentUser.step4', {
                      defaultValue: 'Complete the form and click "Sign Up". You will now be part of your company\'s team.',
                    })}
                  </li>
                </ol>
              </div>
            </div>
          </section>

          <section className='surface-card p-5 lg:p-6 space-y-3'>
            <h2 className='text-lg font-semibold text-white'>
              {t('userManual.section.usingTheApp.title', { defaultValue: '2. Using the Application' })}
            </h2>
            <div className='space-y-2 text-sm text-slate-200'>
              <div className='surface-card-soft p-4 space-y-2'>
                <h3 className='text-sm font-semibold text-white'>
                  {t('userManual.section.usingTheApp.login.title', { defaultValue: 'Logging In' })}
                </h3>
                <p>{t('userManual.section.usingTheApp.login.desc', { defaultValue: 'To log in, you will always need three pieces of information: your email, your password, and your company\'s name.' })}</p>
              </div>

              <div className='grid gap-4 lg:grid-cols-3'>
                <div className='surface-card-soft p-4 space-y-2'>
                  <h3 className='text-sm font-semibold text-white'>
                    {t('userManual.section.usingTheApp.user.title', { defaultValue: 'User Dashboard' })}
                  </h3>
                  <p>{t('userManual.section.usingTheApp.user.desc', { defaultValue: 'As a user, your main goal is to get help. Click "Get AI Help" to start a chat with our AI assistant, Nexus. Describe your problem, and Nexus will guide you. If it cannot solve the issue, it will suggest creating a ticket, which you can finalize and submit.' })}</p>
                </div>
                <div className='surface-card-soft p-4 space-y-2'>
                  <h3 className='text-sm font-semibold text-white'>
                    {t('userManual.section.usingTheApp.agent.title', { defaultValue: 'Agent Dashboard' })}
                  </h3>
                  <p>{t('userManual.section.usingTheApp.agent.desc', { defaultValue: 'Agents can view unassigned tickets and take ownership of them. You can also see a list of tickets currently assigned to you. Open any ticket to communicate with the user and resolve their issue.' })}</p>
                </div>
                <div className='surface-card-soft p-4 space-y-2'>
                  <h3 className='text-sm font-semibold text-white'>
                    {t('userManual.section.usingTheApp.manager.title', { defaultValue: 'Manager Dashboard' })}
                  </h3>
                  <p>{t('userManual.section.usingTheApp.manager.desc', { defaultValue: 'The Manager Dashboard provides a complete overview. You can:' })}</p>
                  <ul className='list-disc pl-4 space-y-1 text-slate-200'>
                    <li>{t('userManual.section.usingTheApp.manager.feature1', { defaultValue: 'View all tickets in the system, regardless of who they are assigned to.' })}</li>
                    <li>{t('userManual.section.usingTheApp.manager.feature2', { defaultValue: 'Assign or re-assign tickets to available agents.' })}</li>
                    <li>{t('userManual.section.usingTheApp.manager.feature3', { defaultValue: 'Filter tickets to analyze trends and performance.' })}</li>
                    <li>{t('userManual.section.usingTheApp.manager.feature4', { defaultValue: 'Manage users: update their roles (e.g., promote a User to an Agent) or delete users.' })}</li>
                    <li>{t('userManual.section.usingTheApp.manager.feature5', { defaultValue: 'Update the company name.' })}</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className='surface-card p-5 lg:p-6 space-y-3'>
            <h2 className='text-lg font-semibold text-white'>
              {t('userManual.section.voice.title', { defaultValue: '3. Voice Features' })}
            </h2>
            <p className='muted-copy'>
              {t('userManual.section.voice.desc', {
                defaultValue:
                  'The application includes voice features to enhance your experience. You can use your microphone to dictate messages in the chat, and the AI\'s responses can be read aloud automatically. Use the speaker and microphone icons to control these features.',
              })}
            </p>
          </section>
        </div>
      </div>
  );
};

export default UserManualPage;
