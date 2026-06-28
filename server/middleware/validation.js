// Validation rules for different endpoints
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s\-\+\(\)]+$/;

function validateEmail(email) {
  if (!email) return false;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  if (!phone) return false;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 7;
}

function validateUsername(username) {
  return username && username.length >= 3 && username.length <= 50;
}

function validatePassword(password) {
  // At least 6 characters (can be enhanced for production)
  return password && password.length >= 6;
}

function validateDateFormat(dateStr) {
  // Check if it's a valid date string (YYYY-MM-DD)
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
}

function validateTimeFormat(timeStr) {
  // Check if it's a valid time string (HH:MM)
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr);
}

function validateRating(rating) {
  return ["poor", "average", "excellent"].includes(rating);
}

function validateServiceType(service) {
  const validServices = [
    "maxillofacial",
    "implants",
    "digital",
    "rootcanal",
    "cosmetic",
    "orthodontics",
    "prosthodontics",
    "whitening",
    "emergency"
  ];
  return validServices.includes(service);
}

function validateAppointmentData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  if (!validatePhone(data.phone)) {
    errors.push("Invalid phone number format");
  }

  if (!validateServiceType(data.service)) {
    errors.push("Invalid service type");
  }

  if (!validateDateFormat(data.date)) {
    errors.push("Invalid date format (use YYYY-MM-DD)");
  }

  if (!validateTimeFormat(data.time)) {
    errors.push("Invalid time format (use HH:MM)");
  }

  if (data.notes && data.notes.length > 1000) {
    errors.push("Notes cannot exceed 1000 characters");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateLoginData(data) {
  const errors = [];

  if (!validateUsername(data.username)) {
    errors.push("Invalid username format");
  }

  if (!validatePassword(data.password)) {
    errors.push("Invalid password format");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateChangePasswordData(data) {
  const errors = [];

  if (!validatePassword(data.oldPassword)) {
    errors.push("Invalid old password format");
  }

  if (!validatePassword(data.newPassword)) {
    errors.push("New password must be at least 6 characters");
  }

  if (data.oldPassword === data.newPassword) {
    errors.push("New password must be different from old password");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateEvaluationData(data) {
  const errors = [];

  if (!data.docKey || !data.docKey.match(/^doc\d$/)) {
    errors.push("Invalid doctor selection");
  }

  const requiredFields = ["behavior", "competence", "treatmentQuality", "explanation", "followUp", "overallSatisfaction"];
  for (const field of requiredFields) {
    if (!validateRating(data[field])) {
      errors.push(`Invalid ${field} rating`);
    }
  }

  if (data.comments && data.comments.length > 1000) {
    errors.push("Comments cannot exceed 1000 characters");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateSurveyData(data) {
  const errors = [];

  ["q1", "q2", "q3", "q4", "q5"].forEach(field => {
    const val = data[field];
    if (val === undefined || val === null) {
      errors.push(`${field} is required`);
    } else if (!Number.isInteger(val) || val < 1 || val > 5) {
      errors.push(`${field} must be an integer between 1 and 5`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

export {
  validateEmail,
  validatePhone,
  validateUsername,
  validatePassword,
  validateDateFormat,
  validateTimeFormat,
  validateRating,
  validateServiceType,
  validateAppointmentData,
  validateLoginData,
  validateChangePasswordData,
  validateEvaluationData,
  validateSurveyData
};
