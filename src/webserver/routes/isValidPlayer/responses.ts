/**
 * These are all the possible successful responses from the isValidPlayer
 * endpoint.
 * @LICENSE GPL-3.0
 * @author Dylan Hackworth <dhpf@pm.me>
 */
export const isValid = {
  "valid": true
}

export type isNotValid = {
  valid: false,
  reason: notValidReason;
}

export type notValidReason = 'no_link' | 'no_role' | 'maintenance';
