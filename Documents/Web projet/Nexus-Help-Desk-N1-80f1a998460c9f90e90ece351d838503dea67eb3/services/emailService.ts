import emailjs from '@emailjs/browser';

interface WelcomeManagerEmailData {
  managerName: string;
  managerEmail: string;
  companyName: string;
  secretCode: string;
  registrationDate: string;
  loginUrl: string;
}

interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Configuration EmailJS
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'your_template_id',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key',
};

// Initialiser EmailJS (à appeler une fois au démarrage de l'app)
export const initEmailService = () => {
  if (EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.publicKey !== 'your_public_key') {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    console.log('✅ EmailJS initialisé avec succès');
  } else {
    console.warn('⚠️ EmailJS non configuré - variables d\'environnement manquantes');
  }
};

// Template d'email simplifié pour EmailJS
const prepareEmailData = (data: WelcomeManagerEmailData) => {
  return {
    to_name: data.managerName,
    to_email: data.managerEmail,
    company_name: data.companyName,
    registration_date: data.registrationDate,
    login_url: data.loginUrl,
    secret_code: data.secretCode,
    
    // Contenu formaté pour le template EmailJS
    email_subject: `🎉 Bienvenue sur Nexus Support Hub - Entreprise "${data.companyName}" créée`,
    
    // Message principal (sera utilisé dans le template EmailJS)
    main_message: `
Félicitations ${data.managerName} !

Votre compte Manager a été créé avec succès pour l'entreprise "${data.companyName}".

📋 RÉCAPITULATIF :
• Manager : ${data.managerName}
• Email : ${data.managerEmail}
• Entreprise : ${data.companyName}
• Date : ${data.registrationDate}
• Rôle : Manager (Accès complet)

🚀 PROCHAINES ÉTAPES :
1. Connectez-vous à votre tableau de bord Manager
2. Invitez votre équipe en partageant le nom : "${data.companyName}"
3. Configurez votre assistant IA Nexus
4. Commencez à gérer les tickets de support

👥 AJOUTER DES MEMBRES :
Pour ajouter des Agents ou Utilisateurs, demandez-leur de s'inscrire avec :
• Rôle : Agent ou Utilisateur
• Nom d'entreprise : "${data.companyName}"

🎥 DÉCOUVRIR NEXUS :
Regardez notre démonstration : https://youtu.be/OnfUuaRlukQ

📞 SUPPORT :
Email : hubnexusinfo@gmail.com
Connexion : ${data.loginUrl}

Développé par REP&WEB - Nexus Support Hub
    `.trim(),
    
    // Informations supplémentaires
    demo_video_url: 'https://youtu.be/OnfUuaRlukQ',
    support_email: 'hubnexusinfo@gmail.com',
    company_instructions: `Pour ajouter des membres à votre équipe, demandez-leur de s'inscrire en utilisant le nom d'entreprise : "${data.companyName}"`,
  };
};

// Envoi d'email via EmailJS
export const sendWelcomeManagerEmail = async (data: WelcomeManagerEmailData): Promise<EmailResponse> => {
  try {
    // Vérifier la configuration
    if (!EMAILJS_CONFIG.serviceId || EMAILJS_CONFIG.serviceId === 'your_service_id') {
      console.warn('⚠️ EmailJS non configuré - utilisation du mode simulation');
      return simulateEmailSending(data);
    }

    const emailData = prepareEmailData(data);
    
    console.log('📧 Envoi d\'email via EmailJS...', {
      to: data.managerEmail,
      company: data.companyName,
      service: EMAILJS_CONFIG.serviceId,
    });

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      emailData,
      EMAILJS_CONFIG.publicKey
    );

    if (result.status === 200) {
      console.log('✅ Email envoyé avec succès via EmailJS', result);
      return {
        success: true,
        message: `Email de bienvenue envoyé à ${data.managerEmail}`
      };
    } else {
      throw new Error(`Statut inattendu: ${result.status}`);
    }

  } catch (error) {
    console.error('❌ Erreur EmailJS:', error);
    
    // Fallback vers la simulation en cas d'erreur
    console.log('🔄 Basculement vers le mode simulation...');
    return simulateEmailSending(data);
  }
};

// Mode simulation (pour développement et fallback)
const simulateEmailSending = async (data: WelcomeManagerEmailData): Promise<EmailResponse> => {
  console.log('🔄 Mode simulation - Email de bienvenue Manager:', {
    to: data.managerEmail,
    subject: `🎉 Bienvenue sur Nexus Support Hub - Entreprise "${data.companyName}" créée`,
    company: data.companyName,
    manager: data.managerName,
    date: data.registrationDate,
    loginUrl: data.loginUrl,
  });
  
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    message: `Email simulé envoyé à ${data.managerEmail} (mode développement)`
  };
};

// Fonction utilitaire pour générer l'URL de connexion
export const generateLoginUrl = (): string => {
  const currentOrigin = window.location.origin;
  const basePath = window.location.pathname.includes('index.html') ? '' : window.location.pathname;
  return `${currentOrigin}${basePath}#/login`;
};

// Fonction utilitaire pour formater la date
export const formatRegistrationDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris'
  }).format(date);
};

// Vérifier la configuration EmailJS
export const checkEmailConfiguration = (): boolean => {
  const isConfigured = EMAILJS_CONFIG.serviceId !== 'your_service_id' && 
                      EMAILJS_CONFIG.templateId !== 'your_template_id' && 
                      EMAILJS_CONFIG.publicKey !== 'your_public_key';
  
  if (!isConfigured) {
    console.warn('⚠️ EmailJS non configuré. Variables requises:', {
      VITE_EMAILJS_SERVICE_ID: '(manquant)',
      VITE_EMAILJS_TEMPLATE_ID: '(manquant)', 
      VITE_EMAILJS_PUBLIC_KEY: '(manquant)'
    });
  }
  
  return isConfigured;
};