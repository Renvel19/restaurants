/* eslint-disable prettier/prettier */
import { TypeOrmModule } from '@nestjs/typeorm';

import { RestaurantEntity } from 'src/restaurant/restaurant.entity/restaurant.entity';
import { PlateEntity } from 'src/plate/plate.entity/plate.entity';

export const TypeOrmTestingConfig = () => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [RestaurantEntity, PlateEntity],
    synchronize: true,
  }),
  TypeOrmModule.forFeature([RestaurantEntity, PlateEntity]),
];
