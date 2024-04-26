import { IsNotEmpty, IsString } from "class-validator";
import { SignupDto } from "./signup.dto";

export class SigninDto extends SignupDto {
  @IsNotEmpty()
  @IsString()
  deviceId!: string;
}
