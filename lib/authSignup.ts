export type SignupValidationIssue = "credentials" | "terms";

export function validateSignupInput(
  email: string,
  password: string,
  acceptedTerms: boolean
): SignupValidationIssue | null {
  if (!email.trim() || password.length < 8) return "credentials";
  if (!acceptedTerms) return "terms";
  return null;
}

/**
 * Supabase can return a successful, deliberately non-identifying response
 * when signUp is called for an address that already belongs to an account.
 * An empty identities array distinguishes that response from a new account.
 */
export function isExistingSignupResponse(
  user:
    | {
        identities?: readonly unknown[] | null;
      }
    | null
    | undefined
): boolean {
  return Array.isArray(user?.identities) && user.identities.length === 0;
}
