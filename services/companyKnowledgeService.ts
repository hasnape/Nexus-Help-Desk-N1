import { supabase } from "./supabaseClient";
import type { Locale } from "../contexts/LanguageContext";

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
  lang: Locale,
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

export function buildFaqContextSnippet(
  faqEntries: CompanyKnowledge[]
): string {
  if (!faqEntries.length) return "";

  const lines: string[] = [];

  lines.push(
    "Company-specific FAQ knowledge (Q/R pairs). Use this as ground truth when relevant:"
  );

  for (const entry of faqEntries) {
    lines.push(`Q: ${entry.question}`);
    lines.push(`A: ${entry.answer}`);
    lines.push("");
  }

  return lines.join("\n");
}
