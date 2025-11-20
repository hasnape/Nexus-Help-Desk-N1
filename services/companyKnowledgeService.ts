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

export type CompanyFaqEntry = {
  id: string;
  company_id: string;
  question: string;
  answer: string;
  tags: string[] | null;
  is_active: boolean;
  lang: string;
  created_at: string;
  updated_at: string | null;
};

const COMPANY_FAQ_COLUMNS =
  "id, company_id, question, answer, tags, is_active, lang, created_at, updated_at";

const sanitizeTags = (tags?: string[]): string[] | null => {
  if (!tags || !tags.length) {
    return null;
  }
  const filtered = tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0);
  return filtered.length ? filtered : null;
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

export async function fetchCompanyFaqsForManager(
  companyId: string,
  lang?: Locale
): Promise<CompanyFaqEntry[]> {
  const query = supabase
    .from("company_knowledge")
    .select(COMPANY_FAQ_COLUMNS)
    .eq("company_id", companyId)
    .eq("type", "faq")
    .order("created_at", { ascending: false });

  if (lang) {
    query.eq("lang", lang);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[companyKnowledge] fetchCompanyFaqsForManager error:", error);
    throw error;
  }

  return (data || []) as CompanyFaqEntry[];
}

export async function createCompanyFaqEntry(input: {
  companyId: string;
  question: string;
  answer: string;
  tags?: string[];
  isActive?: boolean;
  lang?: string;
}): Promise<CompanyFaqEntry> {
  const payload = {
    company_id: input.companyId,
    question: input.question.trim(),
    answer: input.answer.trim(),
    tags: sanitizeTags(input.tags),
    is_active: input.isActive ?? true,
    type: "faq",
    lang: input.lang || "fr",
  };

  const { data, error } = await supabase
    .from("company_knowledge")
    .insert(payload)
    .select(COMPANY_FAQ_COLUMNS)
    .single();

  if (error) {
    console.error("[companyKnowledge] createCompanyFaqEntry error:", error);
    throw error;
  }

  return data as CompanyFaqEntry;
}

export async function updateCompanyFaqEntry(input: {
  id: string;
  companyId: string;
  question?: string;
  answer?: string;
  tags?: string[];
  isActive?: boolean;
  lang?: string;
}): Promise<CompanyFaqEntry> {
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof input.question === "string") {
    updatePayload.question = input.question.trim();
  }
  if (typeof input.answer === "string") {
    updatePayload.answer = input.answer.trim();
  }
  if (typeof input.isActive === "boolean") {
    updatePayload.is_active = input.isActive;
  }
  if (input.tags !== undefined) {
    updatePayload.tags = sanitizeTags(input.tags);
  }
  if (typeof input.lang === "string" && input.lang.trim()) {
    updatePayload.lang = input.lang;
  }

  const { data, error } = await supabase
    .from("company_knowledge")
    .update(updatePayload)
    .eq("id", input.id)
    .eq("company_id", input.companyId)
    .eq("type", "faq")
    .select(COMPANY_FAQ_COLUMNS)
    .single();

  if (error) {
    console.error("[companyKnowledge] updateCompanyFaqEntry error:", error);
    throw error;
  }

  return data as CompanyFaqEntry;
}

export async function deleteCompanyFaqEntry(input: {
  id: string;
  companyId: string;
}): Promise<void> {
  const { error } = await supabase
    .from("company_knowledge")
    .delete()
    .eq("id", input.id)
    .eq("company_id", input.companyId)
    .eq("type", "faq");

  if (error) {
    console.error("[companyKnowledge] deleteCompanyFaqEntry error:", error);
    throw error;
  }
}
