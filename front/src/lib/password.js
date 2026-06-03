// Politique de mot de passe — doit rester alignée avec le back
// (back/app/validators/user.ts : PASSWORD_REGEX / PASSWORD_MIN_LENGTH).
export const PASSWORD_MIN_LENGTH = 12;

export function passwordChecks(value = "") {
  return {
    length: value.length >= PASSWORD_MIN_LENGTH,
    lower: /[a-z]/.test(value),
    upper: /[A-Z]/.test(value),
    digit: /\d/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };
}

export function isPasswordValid(value = "") {
  const c = passwordChecks(value);
  return c.length && c.lower && c.upper && c.digit && c.special;
}
