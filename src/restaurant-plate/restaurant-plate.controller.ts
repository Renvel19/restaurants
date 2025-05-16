/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
import { RestaurantPlateService } from './restaurant-plate.service';
import { PlateDto } from 'src/plate/plate.dto/plate.dto';
import { PlateEntity } from 'src/plate/plate.entity/plate.entity';

@Controller('restaurants')
@UseInterceptors(BusinessErrorsInterceptor)
export class RestaurantPlateController {
  constructor(
    private readonly restaurantArtworkService: RestaurantPlateService,
  ) {}

  @Post(':restaurantId/plates/:plateId')
  async addArtworkMuseum(
    @Param('restaurantId') restaurantId: string,
    @Param('plateId') plateId: string,
  ) {
    return await this.restaurantArtworkService.addDishToRestaurant(
      restaurantId,
      plateId,
    );
  }

  @Get(':restaurantId/plates/:plateId')
  async findArtworkByMuseumIdArtworkId(
    @Param('restaurantId') restaurantId: string,
    @Param('plateId') plateId: string,
  ) {
    return await this.restaurantArtworkService.findDishFromRestaurant(
      restaurantId,
      plateId,
    );
  }

  @Get(':restaurantId/plate')
  async findArtworksByMuseumId(@Param('restaurantId') restaurantId: string) {
    return await this.restaurantArtworkService.findDishesFromRestaurant(
      restaurantId,
    );
  }

  @Put(':restaurantId/plates')
  async associateArtworksMuseum(
    @Body() platesDto: PlateDto[],
    @Param('restaurantId') restaurantId: string,
  ) {
    const plates = plainToInstance(PlateEntity, platesDto);
    return await this.restaurantArtworkService.updateDishesFromRestaurant(
      restaurantId,
      plates,
    );
  }

  @Delete(':restaurantId/plates/:plateId')
  @HttpCode(204)
  async deleteArtworkMuseum(
    @Param('restaurantId') restaurantId: string,
    @Param('plateId') plateId: string,
  ) {
    return await this.restaurantArtworkService.deleteDishFromRestaurant(
      restaurantId,
      plateId,
    );
  }
}
