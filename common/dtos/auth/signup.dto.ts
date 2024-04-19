import {
  isEmail,
  IsNotEmpty,
  isPhoneNumber,
  IsString,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint()
export class IsEmailOrPhoneNumber implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (typeof value !== "string") {
      return false;
    }

    return isPhoneNumber(value) || isEmail(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} should be email address or phone number`;
  }
}

export class SignupDto {
  @IsNotEmpty()
  @Validate(IsEmailOrPhoneNumber)
  id!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
