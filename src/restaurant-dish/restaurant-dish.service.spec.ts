/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantPlateService } from './restaurant-plate.service';
import { Repository } from 'typeorm';
import { RestaurantEntity } from '../restaurant/restaurant.entity/restaurant.entity';
import { PlateEntity } from '../plate/plate.entity/plate.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { CuisineType } from '../shared/enums/cuisine_type';
import { PlateCategory } from '../shared/enums/plate_category';

const generateRestaurant = (): RestaurantEntity => ({
  id: uuidv4(),
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  web: faker.image.url(),
  cuisine: CuisineType.COLOMBIAN,
  plates: [],
});

const generatePlate = (): PlateEntity => ({
  id: uuidv4(),
  name: faker.food.dish(),
  description: faker.food.dish(),
  price: faker.number.int(),
  category: PlateCategory.DESSERT,
  restaurants: [],
});

describe('RestaurantPlateService', () => {
  let service: RestaurantPlateService;
  let restaurantRepository: Repository<RestaurantEntity>;
  let plateRepository: Repository<PlateEntity>;
  let restaurant: RestaurantEntity;
  let plate: PlateEntity;
  let platesList: PlateEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantPlateService,
        {
          provide: getRepositoryToken(RestaurantEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PlateEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RestaurantPlateService>(RestaurantPlateService);
    restaurantRepository = module.get<Repository<RestaurantEntity>>(
      getRepositoryToken(RestaurantEntity),
    );
    plateRepository = module.get<Repository<PlateEntity>>(
      getRepositoryToken(PlateEntity),
    );
    restaurant = generateRestaurant();
    plate = generatePlate();
    platesList = [generatePlate(), generatePlate()];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addDishToRestaurant', () => {
    it('should add a plate to a restaurant', async () => {
      const restaurantWithPlates = { ...restaurant, plates: [] };
      jest.spyOn(plateRepository, 'findOne').mockResolvedValue(plate);
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithPlates);
      jest
        .spyOn(restaurantRepository, 'save')
        .mockResolvedValue({ ...restaurantWithPlates, plates: [plate] });

      const result = await service.addDishToRestaurant(restaurant.id, plate.id);
      expect(result.plates).toHaveLength(1);
      expect(result.plates[0]).toEqual(plate);
      expect(plateRepository.findOne).toHaveBeenCalledWith({
        where: { id: plate.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['plates'],
      });
      expect(restaurantRepository.save).toHaveBeenCalledWith({
        ...restaurantWithPlates,
        plates: [plate],
      });
    });

    it('should throw BusinessLogicException if plate not found', async () => {
      jest.spyOn(plateRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.addDishToRestaurant(restaurant.id, plate.id),
      ).rejects.toHaveProperty(
        'message',
        'The plate with the given id was not found',
      );
      expect(plateRepository.findOne).toHaveBeenCalledWith({
        where: { id: plate.id },
      });
      expect(restaurantRepository.findOne).not.toHaveBeenCalled();
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicException if restaurant not found', async () => {
      jest.spyOn(plateRepository, 'findOne').mockResolvedValue(plate);
      jest.spyOn(restaurantRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.addDishToRestaurant(restaurant.id, plate.id),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
      expect(plateRepository.findOne).toHaveBeenCalledWith({
        where: { id: plate.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['plates'],
      });
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicException if the restaurant already has the plate', async () => {
      const restaurantWithExistingPlate = { ...restaurant, plates: [plate] };
      jest.spyOn(plateRepository, 'findOne').mockResolvedValue(plate);
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithExistingPlate);

      await expect(
        service.addDishToRestaurant(restaurant.id, plate.id),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant already has that plate registered.',
      );
      expect(plateRepository.findOne).toHaveBeenCalledWith({
        where: { id: plate.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['plates'],
      });
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findDishesFromRestaurant', () => {
    it('should return all plates associated with a restaurant', async () => {
      const restaurantWithPlates = { ...restaurant, plates: platesList };
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithPlates);

      const result = await service.findDishesFromRestaurant(restaurant.id);
      expect(result).toEqual(platesList);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['plates'],
      });
    });

    it('should throw BusinessLogicException if restaurant not found', async () => {
      jest.spyOn(restaurantRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.findDishesFromRestaurant(restaurant.id),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['plates'],
      });
    });
  });

  describe('findDishFromRestaurant', () => {
    it('should return a specific plate associated with a restaurant', async () => {
      const restaurantWithPlates = {
        ...restaurant,
        plates: [plate, generatePlate()],
      };
      jest.spyOn(plateRepository, 'findOne').mockResolvedValue(plate);
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithPlates);

      const result = await service.findDishFromRestaurant(
        restaurant.id,
        plate.id,
      );
      expect(result).toEqual(plate);
      expect(plateRepository.findOne).toHaveBeenCalledWith({
        where: { id: plate.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['plates'],
      });
    });

    it('should throw BusinessLogicException if plate not found', async () => {
      jest.spyOn(plateRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.findDishFromRestaurant(restaurant.id, plate.id),
      ).rejects.toHaveProperty(
        'message',
        'The plate with the given id was not found',
      );
      expect(plateRepository.findOne).toHaveBeenCalledWith({
        where: { id: plate.id },
      });
      expect(restaurantRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicException if restaurant not found', async () => {
      jest.spyOn(plateRepository, 'findOne').mockResolvedValue(plate);
      jest.spyOn(restaurantRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.findDishFromRestaurant(restaurant.id, plate.id),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
      expect(plateRepository.findOne).toHaveBeenCalledWith({
        where: { id: plate.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['plates'],
      });
    });

    it('should throw BusinessLogicException if the plate is not associated with the restaurant', async () => {
      const restaurantWithOtherPlates = {
        ...restaurant,
        plates: [generatePlate()],
      };
      jest.spyOn(plateRepository, 'findOne').mockResolvedValue(plate);
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithOtherPlates);

      await expect(
        service.findDishFromRestaurant(restaurant.id, plate.id),
      ).rejects.toHaveProperty(
        'message',
        'The plate with the given id is not associated to the restaurant',
      );
      expect(plateRepository.findOne).toHaveBeenCalledWith({
        where: { id: plate.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['plates'],
      });
    });
  });

  describe('deleteDishFromRestaurant', () => {
    it('should remove a plate from a restaurant', async () => {
      const plateToDelete = generatePlate();
      const restaurantWithPlateToDelete = {
        ...restaurant,
        plates: [plate, plateToDelete],
      };
      jest.spyOn(plateRepository, 'findOne').mockResolvedValue(plate);
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithPlateToDelete);
      jest.spyOn(restaurantRepository, 'save').mockResolvedValue({
        ...restaurant,
        plates: [plateToDelete],
      });

      await service.deleteDishFromRestaurant(restaurant.id, plate.id);
      expect(plateRepository.findOne).toHaveBeenCalledWith({
        where: { id: plate.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['plates'],
      });
      expect(restaurantRepository.save).toHaveBeenCalledWith({
        ...restaurant,
        plates: [plateToDelete],
      });
    });

    it('should throw BusinessLogicException if plate not found', async () => {
      jest.spyOn(plateRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.deleteDishFromRestaurant(restaurant.id, plate.id),
      ).rejects.toHaveProperty(
        'message',
        'The plate with the given id was not found',
      );
      expect(plateRepository.findOne).toHaveBeenCalledWith({
        where: { id: plate.id },
      });
      expect(restaurantRepository.findOne).not.toHaveBeenCalled();
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicException if restaurant not found', async () => {
      jest.spyOn(plateRepository, 'findOne').mockResolvedValue(plate);
      jest.spyOn(restaurantRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.deleteDishFromRestaurant(restaurant.id, plate.id),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
      expect(plateRepository.findOne).toHaveBeenCalledWith({
        where: { id: plate.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['plates'],
      });
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicException if the plate is not associated with the restaurant', async () => {
      const restaurantWithOtherPlates = {
        ...restaurant,
        plates: [generatePlate()],
      };
      jest.spyOn(plateRepository, 'findOne').mockResolvedValue(plate);
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithOtherPlates);

      await expect(
        service.deleteDishFromRestaurant(restaurant.id, plate.id),
      ).rejects.toHaveProperty(
        'message',
        'The plate with the given id is not associated to the restaurant',
      );
      expect(plateRepository.findOne).toHaveBeenCalledWith({
        where: { id: plate.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['plates'],
      });
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateDishesFromRestaurant', () => {
    it('should update the list of plates for a restaurant', async () => {
      const newPlatesList = [generatePlate(), generatePlate()];
      const restaurantWithExistingPlates = { ...restaurant, plates: [plate] };
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithExistingPlates);
      jest
        .spyOn(plateRepository, 'findOne')
        .mockResolvedValueOnce(newPlatesList[0])
        .mockResolvedValueOnce(newPlatesList[1]);
      jest
        .spyOn(restaurantRepository, 'save')
        .mockResolvedValue({ ...restaurant, plates: newPlatesList });

      await service.updateDishesFromRestaurant(
        restaurant.id,
        newPlatesList.map((p) => p.id),
      );
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['plates'],
      });
      expect(plateRepository.findOne).toHaveBeenCalledTimes(
        newPlatesList.length,
      );
      expect(restaurantRepository.save).toHaveBeenCalledWith({
        ...restaurant,
        plates: newPlatesList,
      });
    });

    it('should throw BusinessLogicException if a plate in the list is not found', async () => {
      const newPlatesList = [generatePlate(), generatePlate()];
      jest
        .spyOn(plateRepository, 'findOne')
        .mockResolvedValueOnce(newPlatesList[0])
        .mockResolvedValueOnce(null);

      await expect(
        service.updateDishesFromRestaurant(
          restaurant.id,
          newPlatesList.map((p) => p.id),
        ),
      ).rejects.toHaveProperty(
        'message',
        'The plate with the given id was not found',
      );
      expect(plateRepository.findOne).toHaveBeenCalledTimes(
        newPlatesList.length,
      );
      expect(restaurantRepository.findOne).not.toHaveBeenCalled();
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicException if restaurant not found', async () => {
      const newPlatesList = [generatePlate()];
      jest
        .spyOn(plateRepository, 'findOne')
        .mockResolvedValue(newPlatesList[0]);
      jest.spyOn(restaurantRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateDishesFromRestaurant(
          restaurant.id,
          newPlatesList.map((p) => p.id),
        ),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
      expect(plateRepository.findOne).toHaveBeenCalledTimes(
        newPlatesList.length,
      );
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['plates'],
      });
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });
  });
});
