/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlateService } from './plate.service';
import { PlateEntity } from './plate.entity/plate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlateEntity])],
  providers: [PlateService],
})
export class PlateModule {}
