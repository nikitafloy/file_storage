import { IsNotEmpty, IsNumberString } from "class-validator";

export class DownloadFileDto {
  @IsNotEmpty()
  @IsNumberString()
  id!: number;
}
