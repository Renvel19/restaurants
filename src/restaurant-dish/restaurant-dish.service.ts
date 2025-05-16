/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantEntity } from '../restaurant/restaurant.entity/restaurant.entity';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business_errors';
import { DishEntity } from '../dish/dish.entity/dish.entity';

@Injectable()
export class RestaurantDishService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,

    @InjectRepository(DishEntity)
    private readonly dishRepository: Repository<DishEntity>,
  ) {}

  async addDishToRestaurant(
    restaurantId: string,
    dishId: string,
  ): Promise<RestaurantEntity> {
    const dish: DishEntity | null = await this.dishRepository.findOne({
      where: { id: dishId },
    });
    if (!dish)
      throw new BusinessLogicException(
        'The dish with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const restaurant: RestaurantEntity | null =
      await this.restaurantRepository.findOne({
        where: { id: restaurantId },
        relations: ['dishes'],
      });
    if (!restaurant)
      throw new BusinessLogicException(
        'The restaurant with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    if (restaurant.dishes.includes(dish)) {
      throw new BusinessLogicException(
        'The restaurant already has that dish registered.',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    restaurant.dishes = [...restaurant.dishes, dish];
    return await this.restaurantRepository.save(restaurant);
  }

  async findDishesFromRestaurant(restaurantId: string): Promise<DishEntity[]> {
    const restaurant: RestaurantEntity | null =
      await this.restaurantRepository.findOne({
        where: { id: restaurantId },
        relations: ['dishes'],
      });
    if (!restaurant)
      throw new BusinessLogicException(
        'The restaurant with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return restaurant.dishes;
  }

  async findDishFromRestaurant(
    restaurantId: string,
    dishId: string,
  ): Promise<DishEntity> {
    const dish: DishEntity | null = await this.dishRepository.findOne({
      where: { id: dishId },
    });
    if (!dish)
      throw new BusinessLogicException(
        'The dish with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const restaurant: RestaurantEntity | null =
      await this.restaurantRepository.findOne({
        where: { id: restaurantId },
        relations: ['dishes'],
      });
    if (!restaurant)
      throw new BusinessLogicException(
        'The restaurant with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const restaurantArtwork: DishEntity | undefined = restaurant.dishes.find(
      (e) => e.id === dish.id,
    );

    if (!restaurantArtwork)
      throw new BusinessLogicException(
        'The dish with the given id is not associated to the restaurant',
        BusinessError.PRECONDITION_FAILED,
      );

    return restaurantArtwork;
  }

  async deleteDishFromRestaurant(restaurantId: string, dishId: string) {
    const dish: DishEntity | null = await this.dishRepository.findOne({
      where: { id: dishId },
    });
    if (!dish)
      throw new BusinessLogicException(
        'The dish with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const restaurant: RestaurantEntity | null =
      await this.restaurantRepository.findOne({
        where: { id: restaurantId },
        relations: ['dishes'],
      });
    if (!restaurant)
      throw new BusinessLogicException(
        'The restaurant with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const restaurantArtwork: DishEntity | undefined = restaurant.dishes.find(
      (e) => e.id === dish.id,
    );

    if (!restaurantArtwork)
      throw new BusinessLogicException(
        'The dish with the given id is not associated to the restaurant',
        BusinessError.PRECONDITION_FAILED,
      );

    restaurant.dishes = restaurant.dishes.filter((e) => e.id !== dishId);
    await this.restaurantRepository.save(restaurant);
  }

  async updateDishesFromRestaurant(restaurantId: string, dishes: DishEntity[]) {
    for (const p of dishes) {
      const dish: DishEntity | null = await this.dishRepository.findOne({
        where: { id: p.id },
      });
      if (!dish)
        throw new BusinessLogicException(
          'The dish with the given id was not found',
          BusinessError.NOT_FOUND,
        );
    }

    const restaurant: RestaurantEntity | null =
      await this.restaurantRepository.findOne({
        where: { id: restaurantId },
        relations: ['dishes'],
      });
    if (!restaurant)
      throw new BusinessLogicException(
        'The restaurant with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    restaurant.dishes = dishes;
    await this.restaurantRepository.save(restaurant);
  }
}
