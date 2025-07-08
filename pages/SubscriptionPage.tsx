
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../App';
import { UserRole } from '../types';
import { Link, useLocation } from 'react-router-dom';
import FreemiumPlanIcon from '../components/plan_images/FreemiumPlanIcon';
import StandardPlanIcon from '../components/plan_images/StandardPlanIcon';
import ProPlanIcon from '../components/plan_images/ProPlanIcon';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
  </svg>
);

const PlanIcon: React.FC<{ planName: string }> = ({ planName }) => {
    switch(planName) {
        case 'standard':
            return <StandardPlanIcon className="w-16 h-16 text-primary" />;
        case 'pro':
            return <ProPlanIcon className="w-16 h-16 text-amber-500" />;
        case 'freemium':
        default:
            return <FreemiumPlanIcon className="w-16 h-16 text-slate-400" />;
    }
}

const SubscriptionPage: React.FC = () => {
    const { t } = useLanguage();
    const { user, company } = useApp();
    const location = useLocation();

    const currentUserPlan = company?.plan || 'freemium';
    const backLinkDestination = user?.role === UserRole.MANAGER ? "/manager/dashboard" : "/dashboard";

    return (
        <div className="max-w-4xl mx-auto">
             <div className="mb-6">
                 <Link to={backLinkDestination} state={{ from: location }} className="inline-flex items-center text-primary hover:text-primary-dark font-semibold text-sm">
                    <ArrowLeftIcon className="w-5 h-5 me-2" />
                    {t('subscription.backToDashboard', { default: 'Back to Dashboard' })}
                </Link>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center">{t('subscription.pageTitle', { default: "Manage Your Subscription" })}</h1>
                 <p className="text-center text-slate-500 max-w-2xl mx-auto mt-2 mb-8">{t('subscription.pageSubtitle', { default: "Review your current subscription plan. For upgrades or changes, please contact our support team." })}</p>

                <div className="my-8 py-6 bg-slate-50 border border-slate-200 rounded-lg">
                    <h2 className="text-lg font-semibold text-slate-700 text-center">{t('subscription.currentPlan.title', { default: "Your Current Plan" })}</h2>
                    <div className="flex flex-col items-center gap-4 mt-4">
                        <PlanIcon planName={currentUserPlan} />
                        <p className="text-3xl font-bold text-primary capitalize">{t(`pricing.${currentUserPlan}.name`)}</p>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-200 text-center text-slate-600">
                    <p>{t('subscription.contactForUpgrade', {default: "To upgrade or change your plan, please"})}{' '}
                        <Link to="/contact" className="font-semibold text-primary hover:underline">
                            {t('pricing.button.contactUs', {default: "contact us"})}
                        </Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
