/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { RestaurantPlateService } from './restaurant-plate.service';
import { RestaurantEntity } from 'src/restaurant/restaurant.entity/restaurant.entity';
import { PlateEntity } from 'src/plate/plate.entity/plate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantPlateController } from './restaurant-plate.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantEntity, PlateEntity])],
  providers: [RestaurantPlateService],
  controllers: [RestaurantPlateController],
})
export class RestaurantPlateModule {}
