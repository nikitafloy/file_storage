import { SignupDto } from "./signup.dto";
import { IsNotEmpty, IsString } from "class-validator";

export class SigninDto extends SignupDto {
  @IsNotEmpty()
  @IsString()
  deviceId!: string;
}
