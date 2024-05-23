export function validEmail(email: string | null | undefined) {
  if (!email) return false;
  if (email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
    return true;
  }
}

export function hasUppercaseLetter(password: string | null | undefined) {
  if (!password) return false;
  return /[A-Z]/.test(password);
}

export function hasLowercaseLetter(password: string | null | undefined) {
  if (!password) return false;
  return /[a-z]/.test(password);
}

export function hasNumber(password: string | null | undefined) {
  if (!password) return false;
  return /[0-9]/.test(password);
}

export function hasSpecialCharacter(password: string | null | undefined) {
  if (!password) return false;
  return /[^A-Za-z0-9]/.test(password);
}
