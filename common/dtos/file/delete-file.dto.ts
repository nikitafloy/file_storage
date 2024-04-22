import { IsNotEmpty, IsNumberString } from "class-validator";

export class DeleteFileDto {
  @IsNotEmpty()
  @IsNumberString()
  id!: number;
}
