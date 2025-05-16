/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlateEntity } from '../plate/plate.entity/plate.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity/restaurant.entity';
import { Repository } from 'typeorm';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business_errors';

@Injectable()
export class RestaurantPlateService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepository: Repository<RestaurantEntity>,

    @InjectRepository(PlateEntity)
    private readonly plateRepository: Repository<PlateEntity>,
  ) {}

  async addDishToRestaurant(
    restaurantId: string,
    plateId: string,
  ): Promise<RestaurantEntity> {
    const plate: PlateEntity | null = await this.plateRepository.findOne({
      where: { id: plateId },
    });
    if (!plate)
      throw new BusinessLogicException(
        'The plate with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const restaurant: RestaurantEntity | null =
      await this.restaurantRepository.findOne({
        where: { id: restaurantId },
        relations: ['plates'],
      });
    if (!restaurant)
      throw new BusinessLogicException(
        'The restaurant with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    if (restaurant.plates.includes(plate)) {
      throw new BusinessLogicException(
        'The restaurant already has that plate registered.',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    restaurant.plates = [...restaurant.plates, plate];
    return await this.restaurantRepository.save(restaurant);
  }

  async findDishesFromRestaurant(restaurantId: string): Promise<PlateEntity[]> {
    const restaurant: RestaurantEntity | null =
      await this.restaurantRepository.findOne({
        where: { id: restaurantId },
        relations: ['plates'],
      });
    if (!restaurant)
      throw new BusinessLogicException(
        'The restaurant with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return restaurant.plates;
  }

  async findDishFromRestaurant(
    restaurantId: string,
    plateId: string,
  ): Promise<PlateEntity> {
    const plate: PlateEntity | null = await this.plateRepository.findOne({
      where: { id: plateId },
    });
    if (!plate)
      throw new BusinessLogicException(
        'The plate with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const restaurant: RestaurantEntity | null =
      await this.restaurantRepository.findOne({
        where: { id: restaurantId },
        relations: ['plates'],
      });
    if (!restaurant)
      throw new BusinessLogicException(
        'The restaurant with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const restaurantArtwork: PlateEntity | undefined = restaurant.plates.find(
      (e) => e.id === plate.id,
    );

    if (!restaurantArtwork)
      throw new BusinessLogicException(
        'The plate with the given id is not associated to the restaurant',
        BusinessError.PRECONDITION_FAILED,
      );

    return restaurantArtwork;
  }

  async deleteDishFromRestaurant(restaurantId: string, plateId: string) {
    const plate: PlateEntity | null = await this.plateRepository.findOne({
      where: { id: plateId },
    });
    if (!plate)
      throw new BusinessLogicException(
        'The plate with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const restaurant: RestaurantEntity | null =
      await this.restaurantRepository.findOne({
        where: { id: restaurantId },
        relations: ['plates'],
      });
    if (!restaurant)
      throw new BusinessLogicException(
        'The restaurant with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    const restaurantArtwork: PlateEntity | undefined = restaurant.plates.find(
      (e) => e.id === plate.id,
    );

    if (!restaurantArtwork)
      throw new BusinessLogicException(
        'The plate with the given id is not associated to the restaurant',
        BusinessError.PRECONDITION_FAILED,
      );

    restaurant.plates = restaurant.plates.filter((e) => e.id !== plateId);
    await this.restaurantRepository.save(restaurant);
  }

  async updateDishesFromRestaurant(
    restaurantId: string,
    plates: PlateEntity[],
  ) {
    for (const p of plates) {
      const plate: PlateEntity | null = await this.plateRepository.findOne({
        where: { id: p.id },
      });
      if (!plate)
        throw new BusinessLogicException(
          'The plate with the given id was not found',
          BusinessError.NOT_FOUND,
        );
    }

    const restaurant: RestaurantEntity | null =
      await this.restaurantRepository.findOne({
        where: { id: restaurantId },
        relations: ['plates'],
      });
    if (!restaurant)
      throw new BusinessLogicException(
        'The restaurant with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    restaurant.plates = plates;
    await this.restaurantRepository.save(restaurant);
  }
}
