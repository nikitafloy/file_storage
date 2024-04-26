import { ValidationError } from "class-validator";
import { VerifyErrors } from "jsonwebtoken";

export function getAllConstraints(errors: ValidationError[]) {
  const constraints: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      const constraintValues = Object.values(error.constraints);
      constraints.push(...constraintValues);
    }

    if (error.children) {
      const childConstraints = getAllConstraints(error.children);
      constraints.push(...childConstraints);
    }
  }

  return constraints;
}

export function isVerifyErrors(error: any): error is VerifyErrors {
  return "inner" in error || "expiredAt" in error || "date" in error;
}
