

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../App';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
  </svg>
);

const UserManualPage: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useApp();
    const location = useLocation();

    const backLinkDestination = user ? '/dashboard' : '/login';

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                     <Link to={backLinkDestination} state={{ from: location }} className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm">
                        <ArrowLeftIcon className="w-5 h-5 me-2" />
                        {t('userManual.backToApp', { default: 'Back to Application' })}
                    </Link>
                </div>
                
                <main className="bg-surface p-6 sm:p-10 rounded-lg shadow-lg">
                    <article className="prose prose-slate max-w-none prose-h2:text-primary prose-h2:border-b prose-h2:pb-2 prose-h3:text-secondary-dark">
                        <h1 className="text-4xl font-bold text-center mb-10 text-slate-800">{t('userManual.pageTitle', { default: 'User Manual' })}</h1>
                        
                        <section>
                            <h2>{t('userManual.section.gettingStarted.title', { default: '1. Getting Started: Account Creation' })}</h2>
                            <p>{t('userManual.section.gettingStarted.intro', { default: 'Welcome to Nexus Support Hub! Your role determines how you sign up and interact with the system.' })}</p>
                            
                            <h3>{t('userManual.section.gettingStarted.manager.title', { default: 'For Managers: Creating a Company' })}</h3>
                            <ol>
                                <li>{t('userManual.section.gettingStarted.manager.step1', { default: 'Navigate to the Sign Up page.' })}</li>
                                <li>{t('userManual.section.gettingStarted.manager.step2', { default: 'Select the "Manager" role from the dropdown.' })}</li>
                                <li>{t('userManual.section.gettingStarted.manager.step3', { default: 'Choose a subscription plan for your company. If you select a paid plan, you will be redirected to PayPal to complete the subscription before your account is created.' })}</li>
                                <li>{t('userManual.section.gettingStarted.manager.step4', { default: 'Enter your new, unique Company Name. This name is critical, as your team will use it to log in.' })}</li>
                                <li>{t('userManual.section.gettingStarted.manager.step5', { default: 'Complete the rest of the form and click the final button to create your company account.' })}</li>
                            </ol>

                            <h3>{t('userManual.section.gettingStarted.agentUser.title', { default: 'For Agents & Users: Joining a Company' })}</h3>
                             <ol>
                                <li>{t('userManual.section.gettingStarted.agentUser.step1', { default: 'Navigate to the Sign Up page.' })}</li>
                                <li>{t('userManual.section.gettingStarted.agentUser.step2', { default: 'Select your role ("Agent" or "User").' })}</li>
                                <li>{t('userManual.section.gettingStarted.agentUser.step3', { default: 'In the "Existing Company Name" field, enter the exact company name provided by your manager.' })}</li>
                                <li>{t('userManual.section.gettingStarted.agentUser.step4', { default: 'Complete the form and click "Sign Up". You will now be part of your company\'s team.' })}</li>
                            </ol>
                        </section>

                        <section>
                            <h2>{t('userManual.section.usingTheApp.title', { default: '2. Using the Application' })}</h2>
                            
                            <h3>{t('userManual.section.usingTheApp.login.title', { default: 'Logging In' })}</h3>
                            <p>{t('userManual.section.usingTheApp.login.desc', { default: 'To log in, you will always need three pieces of information: your email, your password, and your company\'s name.' })}</p>

                            <h3>{t('userManual.section.usingTheApp.user.title', { default: 'User Dashboard' })}</h3>
                            <p>{t('userManual.section.usingTheApp.user.desc', { default: 'As a user, your main goal is to get help. Click "Get AI Help" to start a chat with our AI assistant, Nexus. Describe your problem, and Nexus will guide you. If it cannot solve the issue, it will suggest creating a ticket, which you can finalize and submit.' })}</p>

                            <h3>{t('userManual.section.usingTheApp.agent.title', { default: 'Agent Dashboard' })}</h3>
                            <p>{t('userManual.section.usingTheApp.agent.desc', { default: 'Agents can view unassigned tickets and take ownership of them. You can also see a list of tickets currently assigned to you. Open any ticket to communicate with the user and resolve their issue.' })}</p>

                            <h3>{t('userManual.section.usingTheApp.manager.title', { default: 'Manager Dashboard' })}</h3>
                            <p>{t('userManual.section.usingTheApp.manager.desc', { default: 'The Manager Dashboard provides a complete overview. You can:' })}</p>
                            <ul>
                                <li>{t('userManual.section.usingTheApp.manager.feature1', { default: 'View all tickets in the system, regardless of who they are assigned to.' })}</li>
                                <li>{t('userManual.section.usingTheApp.manager.feature2', { default: 'Assign or re-assign tickets to available agents.' })}</li>
                                <li>{t('userManual.section.usingTheApp.manager.feature3', { default: 'Filter tickets to analyze trends and performance.' })}</li>
                                <li>{t('userManual.section.usingTheApp.manager.feature4', { default: 'Manage users: update their roles (e.g., promote a User to an Agent) or delete users.' })}</li>
                                <li>{t('userManual.section.usingTheApp.manager.feature5', { default: 'Update the company name.' })}</li>
                            </ul>
                        </section>
                         <section>
                            <h2>{t('userManual.section.voice.title', { default: '3. Voice Features' })}</h2>
                            <p>{t('userManual.section.voice.desc', { default: 'The application includes voice features to enhance your experience. You can use your microphone to dictate messages in the chat, and the AI\'s responses can be read aloud automatically. Use the speaker and microphone icons to control these features.' })}</p>
                        </section>
                    </article>
                </main>
                 <footer className="py-8 mt-8 border-t border-slate-200 text-center text-xs text-slate-500">
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

export default UserManualPage;