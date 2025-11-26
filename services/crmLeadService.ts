// services/crmLeadService.ts
import { supabase } from "./supabaseClient";

export type CrmLeadInput = {
  company_name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  role_type?: string;       // 'freelance' | 'petite_équipe' | 'service_it' | ...
  main_channel?: string;    // 'email' | 'whatsapp' | 'telephone' | ...
  ticket_volume?: string;   // '0-5' | '5-20' | '20-50' | '50+'
  main_pain?: string;
  interest?: string;        // 'freemium' | 'demo' | 'juste_curieux'
  source: string;           // 'website_bot' | 'landing_form' | 'linkedin_manual' | ...
  channel?: string;         // 'email' | 'linkedin' | 'website'
};

export async function createCrmLead(input: CrmLeadInput) {
  let companyId: string | null = null;

  if (input.company_name) {
    const { data: existingCompany, error: companySelectError } = await supabase
      .from("crm_companies")
      .select("id")
      .eq("name", input.company_name)
      .maybeSingle();

    if (companySelectError) {
      console.warn("Error checking existing company", companySelectError);
    }

    if (existingCompany?.id) {
      companyId = existingCompany.id;
    } else {
      const { data: newCompany, error: companyInsertError } = await supabase
        .from("crm_companies")
        .insert([{ name: input.company_name }])
        .select("id")
        .single();

      if (companyInsertError) {
        console.error("Error creating company", companyInsertError);
      } else {
        companyId = newCompany.id;
      }
    }
  }

  const { data: lead, error: leadError } = await supabase
    .from("crm_leads")
    .insert([
      {
        company_id: companyId,
        full_name: input.full_name,
        email: input.email,
        role: input.role,
        role_type: input.role_type,
        main_channel: input.main_channel,
        ticket_volume: input.ticket_volume,
        main_pain: input.main_pain,
        interest: input.interest,
        source: input.source,
        channel: input.channel ?? "website",
        status: "new",
        sequence_step: 0,
      },
    ])
    .select()
    .single();

  if (leadError) {
    console.error("Error creating CRM lead", leadError);
    throw leadError;
  }

  return lead;
}
