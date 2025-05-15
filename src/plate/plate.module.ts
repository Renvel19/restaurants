/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from 'src/restaurant/restaurant.entity/restaurant.entity';
import { PlateService } from './plate.service';

@Module({ imports: [TypeOrmModule.forFeature([RestaurantEntity])], providers: [PlateService] })
export class PlateModule {}
