/**
 * Safer activation code consumption for auth-signup edge function.
 * 
 * This helper provides atomic consumption of activation codes to prevent
 * race conditions where multiple signups could consume the same code.
 * 
 * Usage in auth-signup/index.ts:
 * 
 * ```typescript
 * import { consumeActivationCode } from "../_patches/auth-signup-consumeActivationCode.ts";
 * 
 * // Instead of:
 * // const { data: activationRow } = await supabase
 * //   .from('manager_activation_codes')
 * //   .select('*')
 * //   .eq('secret_code', secretCode)
 * //   .single();
 * // 
 * // if (activationRow.consumed) { ... }
 * // await supabase.from('manager_activation_codes').update({ consumed: true })...
 * 
 * // Use:
 * const result = await consumeActivationCode(supabase, secretCode);
 * if (!result.success) {
 *   return json({ error: result.error }, result.status, cors);
 * }
 * const activationRow = result.data;
 * ```
 */

export type ActivationCodeRow = {
  id: string;
  company_name: string | null;
  consumed: boolean | null;
  expires_at: string | null;
  secret_code?: string;
  created_at?: string;
};

export type ConsumeActivationCodeResult =
  | {
      success: true;
      data: ActivationCodeRow;
    }
  | {
      success: false;
      error: string;
      status: number;
    };

/**
 * Atomically consume an activation code.
 * 
 * This function uses a single UPDATE with WHERE conditions to ensure
 * the code is only consumed once, preventing race conditions.
 * 
 * @param supabase - Supabase client with service role
 * @param secretCode - The activation code to consume
 * @returns Result with the activation row or error details
 */
export async function consumeActivationCode(
  supabase: any,
  secretCode: string
): Promise<ConsumeActivationCodeResult> {
  if (!secretCode || !secretCode.trim()) {
    return {
      success: false,
      error: "invalid_activation_code",
      status: 400,
    };
  }

  const trimmedCode = secretCode.trim();
  const now = new Date().toISOString();

  try {
    // Atomic update: only update if code exists, not consumed, and not expired
    const { data, error } = await supabase
      .from("manager_activation_codes")
      .update({ consumed: true, consumed_at: now })
      .eq("secret_code", trimmedCode)
      .eq("consumed", false)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .select()
      .single();

    if (error) {
      // Check specific error codes
      if (error.code === "PGRST116") {
        // No rows returned - code doesn't exist, already consumed, or expired
        return {
          success: false,
          error: "invalid_or_expired_activation_code",
          status: 400,
        };
      }

      console.error("Error consuming activation code:", error);
      return {
        success: false,
        error: "activation_code_error",
        status: 500,
      };
    }

    if (!data) {
      return {
        success: false,
        error: "activation_code_not_found",
        status: 400,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("Exception consuming activation code:", err);
    return {
      success: false,
      error: "activation_code_exception",
      status: 500,
    };
  }
}

/**
 * Validate activation code without consuming it.
 * Useful for checking if a code is valid before starting signup process.
 * 
 * @param supabase - Supabase client
 * @param secretCode - The activation code to validate
 * @returns Result indicating if code is valid
 */
export async function validateActivationCode(
  supabase: any,
  secretCode: string
): Promise<{
  valid: boolean;
  error?: string;
  data?: ActivationCodeRow;
}> {
  if (!secretCode || !secretCode.trim()) {
    return { valid: false, error: "empty_code" };
  }

  const trimmedCode = secretCode.trim();
  const now = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from("manager_activation_codes")
      .select("*")
      .eq("secret_code", trimmedCode)
      .single();

    if (error || !data) {
      return { valid: false, error: "code_not_found" };
    }

    if (data.consumed) {
      return { valid: false, error: "code_already_used" };
    }

    if (data.expires_at && data.expires_at <= now) {
      return { valid: false, error: "code_expired" };
    }

    return { valid: true, data };
  } catch (err) {
    console.error("Exception validating activation code:", err);
    return { valid: false, error: "validation_exception" };
  }
}

/**
 * Create a new activation code (for admin functions).
 * 
 * @param supabase - Supabase client with service role
 * @param companyName - Company name for the activation code
 * @param expiresInDays - Number of days until expiration (null for no expiration)
 * @returns The created activation code
 */
export async function createActivationCode(
  supabase: any,
  companyName: string,
  expiresInDays: number | null = 30
): Promise<{
  success: boolean;
  data?: ActivationCodeRow;
  error?: string;
}> {
  try {
    const secretCode = generateSecretCode();
    const expiresAt =
      expiresInDays !== null
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const { data, error } = await supabase
      .from("manager_activation_codes")
      .insert({
        company_name: companyName,
        secret_code: secretCode,
        consumed: false,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating activation code:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Exception creating activation code:", err);
    return { success: false, error: String(err) };
  }
}

/**
 * Generate a secure random activation code.
 */
function generateSecretCode(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}
