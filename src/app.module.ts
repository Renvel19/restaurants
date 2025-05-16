/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantModule } from './restaurant/restaurant.module';
import { DishModule } from './dish/dish.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from './restaurant/restaurant.entity/restaurant.entity';
import { DishEntity } from './dish/dish.entity/dish.entity';
import { RestaurantDishModule } from './restaurant-dish/restaurant-dish.module';

@Module({
  imports: [
    DishModule,
    RestaurantModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1q2w3e4r',
      database: 'restaurant',
      entities: [RestaurantEntity, DishEntity],
      dropSchema: true,
      synchronize: true,
    }),
    RestaurantDishModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
