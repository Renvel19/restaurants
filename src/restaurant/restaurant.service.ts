/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from './restaurant.entity/restaurant.entity';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business_errors';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,
  ) {}

  async findAll(): Promise<RestaurantEntity[]> {
    return await this.restaurantRepository.find({ relations: ['dishes'] });
  }

  async findOne(id: string): Promise<RestaurantEntity> {
    const restaurant: RestaurantEntity | null =
      await this.restaurantRepository.findOne({
        where: { id },
        relations: ['dishes'],
      });
    if (!restaurant)
      throw new BusinessLogicException(
        'The restaurant with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return restaurant;
  }

  async create(restaurant: RestaurantEntity): Promise<RestaurantEntity> {
    return await this.restaurantRepository.save(restaurant);
  }

  async update(
    id: string,
    restaurant: RestaurantEntity,
  ): Promise<RestaurantEntity> {
    const persistedrestaurant: RestaurantEntity | null =
      await this.restaurantRepository.findOne({ where: { id } });
    if (!persistedrestaurant)
      throw new BusinessLogicException(
        'The restaurant with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return await this.restaurantRepository.save({
      ...persistedrestaurant,
      ...restaurant,
    });
  }

  async delete(id: string) {
    const restaurant: RestaurantEntity | null =
      await this.restaurantRepository.findOne({
        where: { id },
      });
    if (!restaurant)
      throw new BusinessLogicException(
        'The restaurant with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    await this.restaurantRepository.remove(restaurant);
  }
}
