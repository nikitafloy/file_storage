import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateFileDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  id!: number;
}
