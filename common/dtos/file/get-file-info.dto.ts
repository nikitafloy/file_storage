import { IsNotEmpty, IsNumber, Min } from "class-validator";
import { Transform } from "class-transformer";

export class GetFileInfoDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  id!: number;
}
