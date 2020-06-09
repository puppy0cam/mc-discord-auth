export const isValid = {
  "valid": true
}

export type isNotValid = {
  valid: false,
  reason: notValidReason;
}

export type notValidReason = 'no_link' | 'no_role' | 'maintenance';
