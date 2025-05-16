/* eslint-disable prettier/prettier */
import { DishEntity } from '../../dish/dish.entity/dish.entity';
import { CuisineType } from '../../shared/enums/cuisine_type';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RestaurantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  web: string;

  @Column({
    type: 'enum',
    enum: CuisineType,
    default: CuisineType.INTERNATIONAL,
  })
  cuisine: CuisineType;

  @ManyToMany(() => DishEntity, (plate) => plate.restaurants)
  @JoinTable()
  dishes: DishEntity[];
}
