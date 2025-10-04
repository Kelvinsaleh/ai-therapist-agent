/**
 * Premium Bypass Utility
 * Manages premium access for specific email addresses
 */

// List of email addresses that should have premium access bypassed
const PREMIUM_BYPASS_EMAILS = [
  "knsalee@gmail.com",
  // Add more emails here as needed
];

/**
 * Check if an email should have premium access bypassed
 * @param email - The email address to check
 * @returns true if the email should have premium access
 */
export function isPremiumBypassEmail(email: string): boolean {
  return PREMIUM_BYPASS_EMAILS.includes(email.toLowerCase());
}

/**
 * Get all premium bypass emails
 * @returns Array of email addresses with premium bypass
 */
export function getPremiumBypassEmails(): string[] {
  return [...PREMIUM_BYPASS_EMAILS];
}

/**
 * Add a new email to the premium bypass list
 * @param email - The email address to add
 * @returns true if added successfully, false if already exists
 */
export function addPremiumBypassEmail(email: string): boolean {
  const normalizedEmail = email.toLowerCase();
  if (!PREMIUM_BYPASS_EMAILS.includes(normalizedEmail)) {
    PREMIUM_BYPASS_EMAILS.push(normalizedEmail);
    return true;
  }
  return false;
}

/**
 * Remove an email from the premium bypass list
 * @param email - The email address to remove
 * @returns true if removed successfully, false if not found
 */
export function removePremiumBypassEmail(email: string): boolean {
  const normalizedEmail = email.toLowerCase();
  const index = PREMIUM_BYPASS_EMAILS.indexOf(normalizedEmail);
  if (index > -1) {
    PREMIUM_BYPASS_EMAILS.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Log premium bypass activation
 * @param email - The email address that activated premium bypass
 */
export function logPremiumBypassActivation(email: string): void {
  console.log(`🎉 Premium bypass activated for ${email}`);
}