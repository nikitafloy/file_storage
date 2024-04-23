import { IsNotEmpty, IsNumber, IsOptional, IsPositive } from "class-validator";
import { Transform } from "class-transformer";

export class GetFilesListDto {
  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  page?: number;

  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  list_size?: number;
}
