export const computePasswordChecks = (password) => ({
  length: password.length >= 8,
  upper: /[A-Z]/.test(password),
  digit: /[0-9]/.test(password),
  special: /[!@#$%^&*()_\-+=\[{\]}\\|;:'\",.<>/?]/.test(password),
});