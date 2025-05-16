/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PlateCategory } from 'src/shared/enums/plate_category';
export class PlateDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsNumber()
  @IsNotEmpty()
  readonly price: number;

  @IsEnum(PlateCategory)
  @IsNotEmpty()
  readonly category: PlateCategory;
}
