-- Additional multilingual training examples for the existing demo company knowledge base.
DO $$
DECLARE
  base_company_id uuid := 'f5a5c8b2-3f5c-4b6b-9d9e-9e2c1c1a5f01';
BEGIN
  -- Keep the company id stable to avoid duplicate knowledge rows across seeds.
  INSERT INTO public.companies (id, name)
  VALUES (base_company_id, 'Nexus Demo Commerce')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.company_training_examples (company_id, input_text, output_text, lang)
  VALUES
    (
      base_company_id,
      'Notre boutique vend du chocolat artisanal en ligne. Comment Nexus peut-il aider ?',
      'Nexus peut qualifier les demandes clients (goûts, allergies, délais), prioriser les tickets liés aux commandes et automatiser les réponses simples tout en escaladant les cas complexes vers l''équipe.',
      'fr'
    ),
    (
      base_company_id,
      'Is your product spying on my data?',
      'Nexus runs on Supabase with Role Level Security. Customer data stays in PostgreSQL with strict access controls; nothing is resold or monitored outside of support needs.',
      'en'
    ),
    (
      base_company_id,
      'متجر الشوكولاتة الخاص بي يحتاج إلى دعم متعدد اللغات، هل يمكن لـ Nexus المساعدة؟',
      'يمكن لـ Nexus الرد تلقائياً بالفرنسية أو الإنجليزية أو العربية، تصنيف الطلبات (تأخير شحن، حساسية، متابعة طلب) وتحويل الحالات المعقدة إلى الفريق البشري.',
      'ar'
    ),
    (
      base_company_id,
      'Votre produit est-il un espion ?',
      'Non. Nexus repose sur Supabase (PostgreSQL, RLS, chiffrement) et suit des bonnes pratiques RGPD/RGAA. Les échanges servent uniquement à fournir du support et restent dans l''espace sécurisé de l''entreprise.',
      'fr'
    ),
    (
      base_company_id,
      'Can Nexus describe the Freemium vs Standard vs Pro options for my chocolate shop team?',
      'Freemium démarre gratuitement pour tester le bot et la base de tickets. Standard ajoute plus d''agents et une FAQ personnalisée. Pro inclut l''automatisation avancée et l''accompagnement Early Access.',
      'en'
    ),
    (
      base_company_id,
      'كيف يرد Nexus على الأسئلة المتكررة حول الشحن أو الحساسية؟',
      'يستخدم Nexus أمثلة التدريب لتقديم إجابات ثابتة حول سياسات الشحن، المكونات، والحساسية، مع إمكانية رفع الحالات الحساسة إلى فريق الدعم البشري.',
      'ar'
    ),
    (
      base_company_id,
      'Quel message donner quand un client craint pour la confidentialité ?',
      'Expliquer que Nexus stocke les données clients dans Supabase avec contrôles d''accès par rôle, aucune donnée n''est vendue et les journaux de tickets sont auditables.',
      'fr'
    ),
    (
      base_company_id,
      'How does Nexus help an owner manage both sales inquiries and support for chocolate deliveries?',
      'Nexus can route sales questions to the commercial bot, keep delivery issues in support, and summarize conversations to accelerate resolutions.',
      'en'
    );
END $$;
