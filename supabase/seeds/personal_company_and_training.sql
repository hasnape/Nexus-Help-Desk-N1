-- Seed for the personal Nexus Hub space (owner / REP&WEB) with stable identifiers.
DO $$
DECLARE
  personal_company_id uuid := '0cbd7c56-8f2a-4a5d-8d4a-2f9d2f0d1e11';
BEGIN
  INSERT INTO public.companies (id, name)
  VALUES (personal_company_id, 'Nexus Hub Personnel (REP&WEB)')
  ON CONFLICT (id) DO NOTHING;

  -- Optional: add internal users for the personal workspace if required by your schema.
  -- INSERT INTO public.users (...)
  -- ON CONFLICT DO NOTHING;

  INSERT INTO public.company_training_examples (company_id, input_text, output_text, lang)
  VALUES
    (
      personal_company_id,
      'Décris Nexus Support Hub pour un propriétaire qui veut un assistant commercial et support unifié.',
      'Nexus Support Hub combine ticketing, chatbot commercial Freemium/Standard/Pro et FAQ personnalisées. La plateforme est en Bêta (Early Access), hébergée sur Supabase (PostgreSQL, RLS) et suit des principes RGPD/RGAA.',
      'fr'
    ),
    (
      personal_company_id,
      'How does the personal Nexus Hub help with my REP&WEB e-commerce clients?',
      'It centralizes support tickets, automates first-level answers, and offers a sales bot that can present pricing, Early Access details, and multilingual support without inventing metrics.',
      'en'
    ),
    (
      personal_company_id,
      'هل يحافظ Nexus على بيانات عملائي بأمان؟',
      'نعم، البيانات محفوظة في PostgreSQL مع سياسات RLS عبر Supabase، مع تحكم دقيق في الأدوار وعدم مشاركة المعلومات خارج مساحة الشركة.',
      'ar'
    ),
    (
      personal_company_id,
      'Cas d’usage e-commerce pour mon espace personnel : paniers abandonnés, suivi colis, retours.',
      'Nexus peut envoyer des rappels factuels, proposer un suivi colis, documenter les politiques de retour et escalader les demandes sensibles à l’humain.',
      'fr'
    ),
    (
      personal_company_id,
      'What should the sales assistant answer when someone asks about pricing tiers?',
      'Explain Freemium for quick trials, Standard for growing teams with custom FAQ, and Pro for automation and guidance. Mention the Beta/Early Access support without giving unverified numbers.',
      'en'
    ),
    (
      personal_company_id,
      'رد على سؤال: هل منتجكم يتجسس على المستخدمين؟',
      'Nexus لا يتجسس على المستخدمين. يعتمد على Supabase مع تشفير وضوابط وصول. البيانات تُستخدم فقط لخدمة الدعم والمبيعات ولا يتم بيعها.',
      'ar'
    );
END $$;
