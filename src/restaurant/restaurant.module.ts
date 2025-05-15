/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from './restaurant.entity/restaurant.entity';
import { RestaurantService } from './restaurant.service';

@Module({ imports: [TypeOrmModule.forFeature([RestaurantEntity])], providers: [RestaurantService] })
export class RestaurantModule {}
