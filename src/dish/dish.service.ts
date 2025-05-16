/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { DishEntity } from './dish.entity/dish.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business_errors';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(DishEntity)
    private readonly dishRepository: Repository<DishEntity>,
  ) {}

  async findAll(): Promise<DishEntity[]> {
    return await this.dishRepository.find({ relations: ['restaurants'] });
  }

  async findOne(id: string): Promise<DishEntity> {
    const dish: DishEntity | null = await this.dishRepository.findOne({
      where: { id },
      relations: ['restaurants'],
    });
    if (!dish)
      throw new BusinessLogicException(
        'The dish with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return dish;
  }

  async create(dish: DishEntity): Promise<DishEntity> {
    return await this.dishRepository.save(dish);
  }

  async update(id: string, dish: DishEntity): Promise<DishEntity> {
    const persistedPlate: DishEntity | null = await this.dishRepository.findOne(
      {
        where: { id },
      },
    );
    if (!persistedPlate)
      throw new BusinessLogicException(
        'The dish with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return await this.dishRepository.save({
      ...persistedPlate,
      ...dish,
    });
  }

  async delete(id: string) {
    const dish: DishEntity | null = await this.dishRepository.findOne({
      where: { id },
    });
    if (!dish)
      throw new BusinessLogicException(
        'The dish with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    await this.dishRepository.remove(dish);
  }
}
