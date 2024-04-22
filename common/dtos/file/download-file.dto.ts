import { IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";
import { Transform } from "class-transformer";

export class DownloadFileDto {
  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  id!: number;
}
