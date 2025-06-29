import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/FormElements';
import Navbar from '../components/Navbar';
import FreemiumPlanIcon from '../components/plan_images/FreemiumPlanIcon';
import StandardPlanIcon from '../components/plan_images/StandardPlanIcon';
import ProPlanIcon from '../components/plan_images/ProPlanIcon';


// Feature Icons
const FeatureIcon: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary ${className}`}>
        {children}
    </div>
);

const AiIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5M19.5 8.25h-1.5m-15 3.75h1.5m15 0h1.5M12 12a4.5 4.5 0 0 1-4.5 4.5V12a4.5 4.5 0 0 1 4.5 4.5Z" />
    </svg>
);

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008h-.008v-.008Z" />
    </svg>
);

const VoiceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-6-6v0a6 6 0 0 0-6 6v1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a3 3 0 0 0 3-3v-1.5a3 3 0 0 0-6 0v1.5a3 3 0 0 0 3 3Z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143z" clipRule="evenodd" />
    </svg>
);

const LandingPage: React.FC = () => {
    const { t } = useLanguage();

    const features = [
        {
            icon: <AiIcon />,
            titleKey: "landing.features.ai.title",
            descKey: "landing.features.ai.desc"
        },
        {
            icon: <ShieldIcon />,
            titleKey: "landing.features.secure.title",
            descKey: "landing.features.secure.desc"
        },
        {
            icon: <VoiceIcon />,
            titleKey: "landing.features.voice.title",
            descKey: "landing.features.voice.desc"
        }
    ];

    const pricingTiers = [
        {
            nameKey: "pricing.freemium.name",
            icon: <FreemiumPlanIcon className="w-10 h-10 text-slate-400"/>,
            priceKey: "pricing.freemium.price",
            descKey: "pricing.freemium.desc",
            features: [
                "pricing.freemium.feature1",
                "pricing.freemium.feature2",
                "pricing.freemium.feature3"
            ],
            buttonKey: "pricing.button.signUp",
            buttonLink: "/signup",
            isPopular: false
        },
        {
            nameKey: "pricing.standard.name",
            icon: <StandardPlanIcon className="w-10 h-10 text-primary"/>,
            priceKey: "pricing.standard.price",
            descKey: "pricing.standard.desc",
            features: [
                "pricing.standard.feature1",
                "pricing.standard.feature2",
                "pricing.standard.feature3",
                "pricing.standard.feature4"
            ],
            buttonKey: "pricing.button.getStarted",
            buttonLink: "/signup",
            isPopular: true
        },
        {
            nameKey: "pricing.pro.name",
            icon: <ProPlanIcon className="w-10 h-10 text-amber-500"/>,
            priceKey: "pricing.pro.price",
            descKey: "pricing.pro.desc",
            features: [
                "pricing.pro.feature1",
                "pricing.pro.feature2",
                "pricing.pro.feature3",
                "pricing.pro.feature4"
            ],
            buttonKey: "pricing.button.getStarted",
            buttonLink: "/signup",
            isPopular: false
        }
    ];

    return (
        <div className="bg-white text-slate-700">
            <Navbar />
            
            {/* Hero Section */}
            <header className="bg-slate-800 text-white">
                <div className="container mx-auto text-center px-6 py-20 sm:py-24 lg:py-32">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">{t('landing.hero.title')}</h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300">{t('landing.hero.subtitle')}</p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link to="/signup">
                            <Button variant="primary" size="lg" className="!bg-sky-500 hover:!bg-sky-600">{t('landing.hero.ctaButton')}</Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="lg" className="!text-slate-100 !border-slate-400 hover:!bg-slate-700">{t('navbar.loginButton')}</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                {/* Features Section */}
                <section id="features" className="py-20 sm:py-24 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">{t('landing.features.title')}</h2>
                            <p className="mt-4 text-lg text-slate-600">{t('landing.features.subtitle')}</p>
                        </div>
                        <div className="mt-16 grid md:grid-cols-3 gap-12">
                            {features.map((feature, index) => (
                                <div key={index} className="flex flex-col items-center text-center">
                                    <FeatureIcon>{feature.icon}</FeatureIcon>
                                    <h3 className="mt-6 text-xl font-bold text-slate-800">{t(feature.titleKey)}</h3>
                                    <p className="mt-2 text-slate-600">{t(feature.descKey)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-20 sm:py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">{t('pricing.title')}</h2>
                            <p className="mt-4 text-lg text-slate-600">{t('pricing.subtitle')}</p>
                        </div>
                        <div className="mt-16 grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {pricingTiers.map((tier) => (
                                <div key={t(tier.nameKey)} className={`border rounded-xl p-8 flex flex-col text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl ${tier.isPopular ? 'border-primary shadow-xl' : 'border-slate-200 shadow-lg'}`}>
                                    {tier.isPopular && <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full self-center mb-4">{t('pricing.popular')}</span>}
                                    <div className="mx-auto mb-4">
                                        {tier.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">{t(tier.nameKey)}</h3>
                                    <p className="mt-2 text-slate-500 flex-grow">{t(tier.descKey)}</p>
                                    <div className="mt-6">
                                        <span className="text-4xl font-bold">{t(tier.priceKey)}</span>
                                        <span className="text-slate-500 ms-1">{t('pricing.perAgentPerMonth')}</span>
                                    </div>
                                    <ul className="mt-8 space-y-4 flex-grow">
                                        {tier.features.map(featureKey => (
                                            <li key={featureKey} className="flex items-center justify-center">
                                                <div className="flex-shrink-0 text-green-500"><CheckIcon /></div>
                                                <span className="ms-3 text-slate-600">{t(featureKey)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-8">
                                        <Link to={tier.buttonLink} className="block w-full">
                                            <Button variant={tier.isPopular ? 'primary' : 'outline'} size="lg" className="w-full">{t(tier.buttonKey)}</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <div className="text-center mt-12 text-slate-500">
                            <p>{t('pricing.enterprise.text')} <Link to="/contact" className="text-primary hover:underline font-semibold">{t('pricing.enterprise.link')}</Link></p>
                         </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;