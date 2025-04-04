export function sanitizeInput(input: string): string {
  return input.replace(/[<>\/\\'";]/g, ""); // Removes potentially harmful characters
}

export function isValidName(name: string): boolean {
  return name.length > 0 && name.length <= 50;
}

export function isValidAge(age: number | undefined): boolean {
  return age !== undefined && age >= 0 && age <= 120 && Number.isInteger(age);
}

export function isValidLocation(location: string): boolean {
  return location.length <= 100;
}

export function isValidGender(gender: string): boolean {
  return ["male", "female", "other"].includes(gender);
}

export function isValidFitnessLevel(level: string): boolean {
  return ["beginner", "intermediate", "advanced"].includes(level);
}
