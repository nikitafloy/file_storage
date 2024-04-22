import { IsNotEmpty, IsNumberString } from "class-validator";

export class UpdateFileDto {
  @IsNotEmpty()
  @IsNumberString()
  id!: number;
}
