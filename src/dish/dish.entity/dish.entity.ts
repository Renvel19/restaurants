/* eslint-disable prettier/prettier */
import { RestaurantEntity } from '../../restaurant/restaurant.entity/restaurant.entity';
import { DishCategory } from '../../shared/enums/dish_category';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class DishEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column({
    type: 'enum',
    enum: DishCategory,
    default: DishCategory.MAIN,
  })
  category: DishCategory;

  @ManyToMany(() => RestaurantEntity, (restaurant) => restaurant.dishes)
  @JoinTable()
  restaurants: RestaurantEntity[];
}
