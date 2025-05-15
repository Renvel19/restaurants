/* eslint-disable prettier/prettier */
import { RestaurantEntity } from '../../restaurant/restaurant.entity/restaurant.entity';
import { PlateCategory } from '../../shared/enums/plate_category';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PlateEntity {
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
    enum: PlateCategory,
    default: PlateCategory.MAIN,
  })
  category: PlateCategory;

  @ManyToMany(() => RestaurantEntity, (restaurant) => restaurant.plates)
  restaurants: RestaurantEntity[];
}
