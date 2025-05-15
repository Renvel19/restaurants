/* eslint-disable prettier/prettier */
import { PlateEntity } from '../../plate/plate.entity/plate.entity';
import { CuisineType } from '../../shared/enums/cuisine_type';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

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

  @ManyToMany(() => PlateEntity, (plate) => plate.restaurants)
  plates: PlateEntity[];
}
