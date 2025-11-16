// src/services/companyKnowledgeService.ts
import { supabase } from "./supabaseClient";
import type { Locale as AppLocale } from "../types";

export type CompanyKnowledge = {
  id: string;
  company_id: string;
  type: "faq" | "procedure" | "macro" | "other";
  lang: string;
  question: string;
  answer: string;
  tags: string[] | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchCompanyFaqForAi(
  companyId: string,
  lang: AppLocale,
  limit: number = 20
): Promise<CompanyKnowledge[]> {
  const { data, error } = await supabase
    .from("company_knowledge")
    .select(
      "id, company_id, type, lang, question, answer, tags, source, created_at, updated_at"
    )
    .eq("company_id", companyId)
    .eq("type", "faq")
    .eq("lang", lang)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[companyKnowledge] fetchCompanyFaqForAi error:", error);
    return [];
  }

  return (data || []) as CompanyKnowledge[];
}

/**
 * Utilitaire pour fabriquer un bloc de contexte texte pour le modèle IA
 * (à partir des Q/R de company_knowledge).
 */
export function buildFaqContextSnippet(
  faqEntries: CompanyKnowledge[]
): string {
  if (!faqEntries.length) return "";

  const lines: string[] = [];

  lines.push(
    "Connaissances spécifiques au client (FAQ Radar / éthylotests & voitures-radars) :"
  );

  for (const entry of faqEntries) {
    lines.push(`Q: ${entry.question}`);
    lines.push(`R: ${entry.answer}`);
    lines.push(""); // ligne vide entre les entrées
  }

  return lines.join("\n");
}
