/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { DishCategory } from 'src/shared/enums/dish_category';
export class DishDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsNumber()
  @IsNotEmpty()
  readonly price: number;

  @IsEnum(DishCategory)
  @IsNotEmpty()
  readonly category: DishCategory;
}
