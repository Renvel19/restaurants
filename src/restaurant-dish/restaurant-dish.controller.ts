/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors/business-errors.interceptor';
import { RestaurantDishService } from './restaurant-dish.service';
import { DishDto } from 'src/dish/dish.dto/dish.dto';
import { DishEntity } from 'src/dish/dish.entity/dish.entity';

@Controller('restaurants')
@UseInterceptors(BusinessErrorsInterceptor)
export class RestaurantDishController {
  constructor(
    private readonly restaurantArtworkService: RestaurantDishService,
  ) {}

  @Post(':restaurantId/dishes/:dishId')
  async addArtworkMuseum(
    @Param('restaurantId') restaurantId: string,
    @Param('dishId') dishId: string,
  ) {
    return await this.restaurantArtworkService.addDishToRestaurant(
      restaurantId,
      dishId,
    );
  }

  @Get(':restaurantId/dishes/:dishId')
  async findArtworkByMuseumIdArtworkId(
    @Param('restaurantId') restaurantId: string,
    @Param('dishId') dishId: string,
  ) {
    return await this.restaurantArtworkService.findDishFromRestaurant(
      restaurantId,
      dishId,
    );
  }

  @Get(':restaurantId/dish')
  async findArtworksByMuseumId(@Param('restaurantId') restaurantId: string) {
    return await this.restaurantArtworkService.findDishesFromRestaurant(
      restaurantId,
    );
  }

  @Put(':restaurantId/dishes')
  async associateArtworksMuseum(
    @Body() dishesDto: DishDto[],
    @Param('restaurantId') restaurantId: string,
  ) {
    const dishes = plainToInstance(DishEntity, dishesDto);
    return await this.restaurantArtworkService.updateDishesFromRestaurant(
      restaurantId,
      dishes,
    );
  }

  @Delete(':restaurantId/dishes/:dishId')
  @HttpCode(204)
  async deleteArtworkMuseum(
    @Param('restaurantId') restaurantId: string,
    @Param('dishId') dishId: string,
  ) {
    return await this.restaurantArtworkService.deleteDishFromRestaurant(
      restaurantId,
      dishId,
    );
  }
}
