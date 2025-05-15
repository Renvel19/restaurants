/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantPlateService } from './restaurant-plate.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PlateEntity } from '../plate/plate.entity/plate.entity';
import { RestaurantEntity } from '../restaurant/restaurant.entity/restaurant.entity';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { CuisineType } from '../shared/enums/cuisine_type';
import { PlateCategory } from '../shared/enums/plate_category';

describe('RestaurantPlateService', () => {
  let service: RestaurantPlateService;
  let restaurantRepository: Repository<RestaurantEntity>;
  let plateRepository: Repository<PlateEntity>;
  let restaurantEntities: RestaurantEntity[];
  let plateEntities: PlateEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantPlateService,
        {
          provide: getRepositoryToken(RestaurantEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PlateEntity),
          useClass: Repository,
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

    // Initialize mock data
    restaurantEntities = [
      {
        id: uuidv4(),
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        web: faker.image.url(),
        cuisine: CuisineType.COLOMBIAN,
        plates: [],
      },
      {
        id: uuidv4(),
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        web: faker.image.url(),
        cuisine: CuisineType.COLOMBIAN,
        plates: [],
      },
    ];

    plateEntities = [
      {
        id: uuidv4(),
        name: faker.food.dish(),
        description: faker.food.dish(),
        price: faker.number.int(),
        category: PlateCategory.DESSERT,
        restaurants: [restaurantEntities[0]],
      },
      {
        id: uuidv4(),
        name: faker.food.dish(),
        description: faker.food.dish(),
        price: faker.number.int(),
        category: PlateCategory.DESSERT,
        restaurants: [restaurantEntities[0]],
      },
      {
        id: uuidv4(),
        name: faker.food.dish(),
        description: faker.food.dish(),
        price: faker.number.int(),
        category: PlateCategory.DESSERT,
        restaurants: [restaurantEntities[0]],
      },
    ];

    // Assign plates to restaurants
    restaurantEntities[0].plates = [plateEntities[0], plateEntities[1]];
    restaurantEntities[1].plates = [plateEntities[2]];

    restaurantRepository.findOne = jest.fn();
    restaurantRepository.save = jest
      .fn()
      .mockResolvedValue(restaurantEntities[0]);
    plateRepository.findOne = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addDishToRestaurant', () => {
    it('should add a dish to a restaurant', async () => {
      // Mock findOne to return the plate and restaurant
      (plateRepository.findOne as jest.Mock).mockResolvedValue(
        plateEntities[2],
      );
      (restaurantRepository.findOne as jest.Mock).mockResolvedValue(
        restaurantEntities[0],
      );

      const updatedRestaurant = await service.addDishToRestaurant(
        restaurantEntities[0].id,
        plateEntities[2].id,
      );
      expect(updatedRestaurant.plates).toContain(plateEntities[2]);
      expect(restaurantRepository.save).toHaveBeenCalledWith(
        restaurantEntities[0],
      );
    });

    it('should throw BusinessLogicException if plate does not exist', async () => {
      (plateRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.addDishToRestaurant(
          restaurantEntities[0].id,
          'non-existent-plate-id',
        ),
      ).rejects.toHaveProperty(
        'message',
        'The plate with the given id was not found',
      );
    });

    it('should throw BusinessLogicException if restaurant does not exist', async () => {
      (plateRepository.findOne as jest.Mock).mockResolvedValue(
        plateEntities[0],
      );
      (restaurantRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.addDishToRestaurant(
          'non-existent-restaurant-id',
          plateEntities[0].id,
        ),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
    });
  });

  describe('findDishesFromRestaurant', () => {
    it('should return all dishes from a restaurant', async () => {
      (restaurantRepository.findOne as jest.Mock).mockResolvedValue(
        restaurantEntities[0],
      );
      const dishes = await service.findDishesFromRestaurant(
        restaurantEntities[0].id,
      );
      expect(dishes).toEqual(restaurantEntities[0].plates);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurantEntities[0].id },
        relations: ['plates'],
      });
    });

    it('should throw BusinessLogicException if restaurant does not exist', async () => {
      (restaurantRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.findDishesFromRestaurant('non-existent-restaurant-id'),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
    });
  });

  describe('findDishFromRestaurant', () => {
    it('should return a dish from a restaurant', async () => {
      (plateRepository.findOne as jest.Mock).mockResolvedValue(
        plateEntities[0],
      );
      (restaurantRepository.findOne as jest.Mock).mockResolvedValue(
        restaurantEntities[0],
      );

      const dish = await service.findDishFromRestaurant(
        restaurantEntities[0].id,
        plateEntities[0].id,
      );
      expect(dish).toEqual(plateEntities[0]);
    });

    it('should throw BusinessLogicException if plate does not exist', async () => {
      (plateRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.findDishFromRestaurant(
          restaurantEntities[0].id,
          'non-existent-plate-id',
        ),
      ).rejects.toHaveProperty(
        'message',
        'The plate with the given id was not found',
      );
    });

    it('should throw BusinessLogicException if restaurant does not exist', async () => {
      (plateRepository.findOne as jest.Mock).mockResolvedValue(
        plateEntities[0],
      );
      (restaurantRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.findDishFromRestaurant(
          'non-existent-restaurant-id',
          plateEntities[0].id,
        ),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
    });

    it('should throw BusinessLogicException if plate is not associated with the restaurant', async () => {
      (plateRepository.findOne as jest.Mock).mockResolvedValue(
        plateEntities[2],
      ); // Plate 3 is associated with restaurant 2
      (restaurantRepository.findOne as jest.Mock).mockResolvedValue(
        restaurantEntities[0],
      ); // We are looking in restaurant 1

      await expect(
        service.findDishFromRestaurant(
          restaurantEntities[0].id,
          plateEntities[2].id,
        ),
      ).rejects.toHaveProperty(
        'message',
        'The plate with the given id is not associated to the restaurant',
      );
    });
  });

  describe('deleteDishFromRestaurant', () => {
    it('should delete a dish from a restaurant', async () => {
      (plateRepository.findOne as jest.Mock).mockResolvedValue(
        plateEntities[0],
      );
      (restaurantRepository.findOne as jest.Mock).mockResolvedValue(
        restaurantEntities[0],
      );

      await service.deleteDishFromRestaurant(
        restaurantEntities[0].id,
        plateEntities[0].id,
      );
      expect(restaurantEntities[0].plates).not.toContain(plateEntities[0]);
      expect(restaurantRepository.save).toHaveBeenCalledWith(
        restaurantEntities[0],
      );
    });

    it('should throw BusinessLogicException if plate does not exist', async () => {
      (plateRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.deleteDishFromRestaurant(
          restaurantEntities[0].id,
          'non-existent-plate-id',
        ),
      ).rejects.toHaveProperty(
        'message',
        'The plate with the given id was not found',
      );
    });

    it('should throw BusinessLogicException if restaurant does not exist', async () => {
      (plateRepository.findOne as jest.Mock).mockResolvedValue(
        plateEntities[0],
      );
      (restaurantRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        service.deleteDishFromRestaurant(
          'non-existent-restaurant-id',
          plateEntities[0].id,
        ),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
    });

    it('should throw BusinessLogicException if plate is not associated with the restaurant', async () => {
      (plateRepository.findOne as jest.Mock).mockResolvedValue(
        plateEntities[2],
      ); // Plate 3 is in Restaurant 2
      (restaurantRepository.findOne as jest.Mock).mockResolvedValue(
        restaurantEntities[0],
      ); // target Restaurant 1

      await expect(
        service.deleteDishFromRestaurant(
          restaurantEntities[0].id,
          plateEntities[2].id,
        ),
      ).rejects.toHaveProperty(
        'message',
        'The plate with the given id is not associated to the restaurant',
      );
    });
  });

  describe('updateDishesFromRestaurant', () => {
    it('should update the dishes of a restaurant', async () => {
      // Mock plateRepository.findOne to return plates
      (plateRepository.findOne as jest.Mock).mockResolvedValue(
        plateEntities[1],
      );
      (restaurantRepository.findOne as jest.Mock).mockResolvedValue(
        restaurantEntities[0],
      );

      const newPlates = [plateEntities[1].id]; //  Pizza Margherita
      await service.updateDishesFromRestaurant(
        restaurantEntities[0].id,
        newPlates,
      );

      expect(restaurantEntities[0].plates.length).toBe(1);
      expect(restaurantEntities[0].plates[0]).toEqual(plateEntities[1]);
      expect(restaurantRepository.save).toHaveBeenCalledWith(
        restaurantEntities[0],
      );
    });

    it('should throw BusinessLogicException if a plate does not exist', async () => {
      (plateRepository.findOne as jest.Mock).mockResolvedValue(null);
      const newPlates = ['non-existent-plate-id'];
      await expect(
        service.updateDishesFromRestaurant(restaurantEntities[0].id, newPlates),
      ).rejects.toHaveProperty(
        'message',
        'The plate with the given id was not found',
      );
    });

    it('should throw BusinessLogicException if the restaurant does not exist', async () => {
      (plateRepository.findOne as jest.Mock).mockResolvedValue(
        plateEntities[0],
      );
      (restaurantRepository.findOne as jest.Mock).mockResolvedValue(null);

      const newPlates = [plateEntities[0].id];
      await expect(
        service.updateDishesFromRestaurant(
          'non-existent-restaurant-id',
          newPlates,
        ),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
    });
  });
});
