/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { CuisineType } from 'src/shared/enums/cuisine_type';
export class RestaurantDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @IsUrl()
  @IsNotEmpty()
  readonly web: string;

  @IsEnum(CuisineType)
  @IsNotEmpty()
  readonly cuisine: CuisineType;
}
