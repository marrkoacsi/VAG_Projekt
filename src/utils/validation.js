// Validation utilities
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateUsername = (username) => {
  return username.length >= 3 && username.length <= 20;
};

export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword && password.length > 0;
};

export const validateForm = (formData, fields) => {
  const errors = {};

  fields.forEach((field) => {
    const value = formData[field];

    if (!value || value.trim() === "") {
      errors[field] = "Ez a mező kötelező";
      return;
    }

    switch (field) {
      case "email":
        if (!validateEmail(value)) {
          errors[field] = "Érvénytelen email cím";
        }
        break;
      case "password":
        if (!validatePassword(value)) {
          errors[field] = "A jelszónak legalább 6 karakter hosszúnak kell lennie";
        }
        break;
      case "passwordConfirm":
      case "password_confirm":
        if (!validatePasswordMatch(formData.password, value)) {
          errors[field] = "A jelszavak nem egyeznek";
        }
        break;
      case "username":
        if (!validateUsername(value)) {
          errors[field] = "A felhasználónév 3-20 karakter közötti";
        }
        break;
      default:
        break;
    }
  });

  return errors;
};
