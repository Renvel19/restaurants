/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishService } from './dish.service';
import { DishEntity } from './dish.entity/dish.entity';
import { DishController } from './dish.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DishEntity])],
  providers: [DishService],
  controllers: [DishController],
})
export class DishModule {}
