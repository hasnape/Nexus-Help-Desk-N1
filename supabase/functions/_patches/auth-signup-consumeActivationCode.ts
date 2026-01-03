/**
 * Safer consumeActivationCode for atomic activation code consumption
 * 
 * Updates manager_activation_codes with consumed = true WHERE id = id AND consumed = false
 * Throws error if already consumed to prevent race conditions
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Atomically consume an activation code
 * @param adminClient - Supabase admin client with service role
 * @param id - Activation code ID
 * @param authUid - User auth UID to associate with consumed code
 * @throws Error if code already consumed or not found
 */
export async function consumeActivationCode(
  adminClient: SupabaseClient,
  id: string,
  authUid: string
): Promise<void> {
  // Atomic update: only succeed if consumed = false
  const { data, error } = await adminClient
    .from('manager_activation_codes')
    .update({ 
      consumed: true,
      consumed_at: new Date().toISOString(),
      consumed_by: authUid
    })
    .eq('id', id)
    .eq('consumed', false)
    .select('id')
    .single();

  if (error) {
    console.error('Error consuming activation code:', error);
    throw new Error(`Failed to consume activation code: ${error.message}`);
  }

  if (!data) {
    // No rows updated - code was already consumed or doesn't exist
    throw new Error('Activation code has already been consumed or does not exist');
  }

  console.log(`Successfully consumed activation code ${id} for user ${authUid}`);
}
