import type { AiProfile, CompanyAiSettings } from "./types.ts";
import { DEFAULT_NEXUS_PROFILE } from "./defaultNexusProfile.ts";
import { LAI_TURNER_PROFILE } from "./laiTurnerProfile.ts";

const PROFILES: AiProfile[] = [LAI_TURNER_PROFILE, DEFAULT_NEXUS_PROFILE];

export function pickAiProfile(opts: {
  companyId?: string | null;
  companyName?: string | null;
  aiSettings?: CompanyAiSettings | null;
}): AiProfile {
  return (
    PROFILES.find((p) => p.match(opts)) ?? DEFAULT_NEXUS_PROFILE
  );
}
