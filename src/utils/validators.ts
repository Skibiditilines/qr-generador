/**
 * Validate an user
 *
 * @param user usuario to validate.
 * @returns An error message if the email is invalid, or 'null' if it is valid.
 */
export function validateUser(user: string): string | null {
  if (!user.trim()) {
    return "eL compo usuario no puede estar vacío";
  }
  return null;
}

/**
 * Validate a password.
 *
 * @param password - Password to validate.
 * @returns An error message if the password does not meet the requirements, or 'null' if it is valid.
 */
export function validatePassword(password: string): string | null {
  if (!password.trim()) {
    return "El campo de contraseña no puede estar vacío";
  }
  return null;
}
