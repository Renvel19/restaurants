/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { RestaurantDishService } from './restaurant-dish.service';
import { RestaurantEntity } from 'src/restaurant/restaurant.entity/restaurant.entity';
import { DishEntity } from 'src/dish/dish.entity/dish.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantDishController } from './restaurant-dish.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantEntity, DishEntity])],
  providers: [RestaurantDishService],
  controllers: [RestaurantDishController],
})
export class RestaurantDishModule {}
