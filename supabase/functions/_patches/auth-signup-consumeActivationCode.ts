/**
 * Atomic Activation Code Consumption Pattern
 * 
 * This snippet provides a safer way to consume activation codes atomically
 * to prevent race conditions when multiple signup requests happen simultaneously
 * with the same activation code.
 * 
 * Usage: Replace the consumeActivationCode logic in auth-signup/index.ts
 * with this atomic update pattern.
 */

// Example implementation for atomic activation code consumption
export async function consumeActivationCodeAtomic(
  supabaseClient: any,
  codeId: string,
  authUid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Atomic update: only succeed if code is not already consumed
    const { data, error } = await supabaseClient
      .from('manager_activation_codes')
      .update({
        consumed: true,
        consumed_by: authUid,
        consumed_at: new Date().toISOString(),
      })
      .eq('id', codeId)
      .eq('consumed', false) // Critical: only update if not already consumed
      .select()
      .single();

    if (error) {
      // If no rows were updated (code already consumed), this will error
      return { success: false, error: 'activation_code_already_used' };
    }

    if (!data) {
      // No row matched the conditions (code was already consumed)
      return { success: false, error: 'activation_code_already_used' };
    }

    return { success: true };
  } catch (err) {
    console.error('Error consuming activation code:', err);
    return { success: false, error: 'database_error' };
  }
}

/**
 * Integration example:
 * 
 * In auth-signup/index.ts, replace:
 * 
 * const consumeActivationCode = async (id: string, authUid: string) => {
 *   await admin
 *     .from("manager_activation_codes")
 *     .update({
 *       consumed: true,
 *       consumed_by: authUid,
 *       consumed_at: new Date().toISOString(),
 *     })
 *     .eq("id", id);
 * };
 * 
 * With:
 * 
 * const consumeActivationCode = async (id: string, authUid: string) => {
 *   const result = await consumeActivationCodeAtomic(admin, id, authUid);
 *   if (!result.success) {
 *     throw new Error(result.error || 'Failed to consume activation code');
 *   }
 * };
 */
