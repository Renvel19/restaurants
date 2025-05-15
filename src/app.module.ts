/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantModule } from './restaurant/restaurant.module';
import { PlateModule } from './plate/plate.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from './restaurant/restaurant.entity/restaurant.entity';
import { PlateEntity } from './plate/plate.entity/plate.entity';

@Module({
  imports: [
    PlateModule,
    RestaurantModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1q2w3e4r',
      database: 'restaurant',
      entities: [RestaurantEntity, PlateEntity],
      dropSchema: true,
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
