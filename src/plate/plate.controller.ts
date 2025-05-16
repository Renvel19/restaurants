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
import { PlateService } from './plate.service';
import { PlateDto } from './plate.dto/plate.dto';
import { PlateEntity } from './plate.entity/plate.entity';

@Controller('plate')
@UseInterceptors(BusinessErrorsInterceptor)
export class PlateController {
  constructor(private readonly plateService: PlateService) {}

  @Get()
  async findAll() {
    return await this.plateService.findAll();
  }

  @Get(':plateId')
  async findOne(@Param('plateId') plateId: string) {
    return await this.plateService.findOne(plateId);
  }

  @Post()
  async create(@Body() plateDto: PlateDto) {
    const plate: PlateEntity = plainToInstance(PlateEntity, plateDto);
    return await this.plateService.create(plate);
  }

  @Put(':plateId')
  async update(@Param('plateId') plateId: string, @Body() plateDto: PlateDto) {
    const plate: PlateEntity = plainToInstance(PlateEntity, plateDto);
    return await this.plateService.update(plateId, plate);
  }

  @Delete(':plateId')
  @HttpCode(204)
  async delete(@Param('plateId') plateId: string) {
    return await this.plateService.delete(plateId);
  }
}
