/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors/business-errors.interceptor';
import { DishService } from './dish.service';
import { DishDto } from './dish.dto/dish.dto';
import { DishEntity } from './dish.entity/dish.entity';

@Controller('dish')
@UseInterceptors(BusinessErrorsInterceptor)
export class DishController {
  constructor(private readonly plateService: DishService) {}

  @Get()
  async findAll() {
    return await this.plateService.findAll();
  }

  @Get(':plateId')
  async findOne(@Param('plateId') plateId: string) {
    return await this.plateService.findOne(plateId);
  }

  @Post()
  async create(@Body() plateDto: DishDto) {
    const plate: DishEntity = plainToInstance(DishEntity, plateDto);
    return await this.plateService.create(plate);
  }

  @Put(':plateId')
  async update(@Param('plateId') plateId: string, @Body() plateDto: DishDto) {
    const plate: DishEntity = plainToInstance(DishEntity, plateDto);
    return await this.plateService.update(plateId, plate);
  }

  @Delete(':plateId')
  @HttpCode(204)
  async delete(@Param('plateId') plateId: string) {
    return await this.plateService.delete(plateId);
  }
}
