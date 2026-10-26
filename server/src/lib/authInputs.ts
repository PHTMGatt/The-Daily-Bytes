export const normalizeAccountText = (value: unknown) => String(value ?? '').trim();

export const normalizeAccountKey = (value: unknown) => normalizeAccountText(value).toLowerCase();

export const readPassword = (value: unknown) => String(value ?? '');

export const isValidEmail = (value: unknown) => {
  const email = normalizeAccountText(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
};
