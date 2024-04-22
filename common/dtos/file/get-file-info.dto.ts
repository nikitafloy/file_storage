import { IsNotEmpty, IsNumberString } from "class-validator";

export class GetFileInfoDto {
  @IsNotEmpty()
  @IsNumberString()
  id!: number;
}
