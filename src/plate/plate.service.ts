/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { PlateEntity } from './plate.entity/plate.entity';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business_errors';

@Injectable()
export class PlateService {
  constructor(
    @InjectRepository(PlateEntity)
    private readonly plateRepository: Repository<PlateEntity>,
  ) {}

  async findAll(): Promise<PlateEntity[]> {
    return await this.plateRepository.find({ relations: ['restaurants'] });
  }

  async findOne(id: string): Promise<PlateEntity> {
    const plate: PlateEntity | null = await this.plateRepository.findOne({
      where: { id },
      relations: ['restaurants'],
    });
    if (!plate)
      throw new BusinessLogicException(
        'The plate with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return plate;
  }

  async create(plate: PlateEntity): Promise<PlateEntity> {
    return await this.plateRepository.save(plate);
  }

  async update(id: string, plate: PlateEntity): Promise<PlateEntity> {
    const persistedPlate: PlateEntity | null =
      await this.plateRepository.findOne({
        where: { id },
      });
    if (!persistedPlate)
      throw new BusinessLogicException(
        'The plate with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    return await this.plateRepository.save({
      ...persistedPlate,
      ...plate,
    });
  }

  async delete(id: string) {
    const plate: PlateEntity | null = await this.plateRepository.findOne({
      where: { id },
    });
    if (!plate)
      throw new BusinessLogicException(
        'The plate with the given id was not found',
        BusinessError.NOT_FOUND,
      );

    await this.plateRepository.remove(plate);
  }
}
