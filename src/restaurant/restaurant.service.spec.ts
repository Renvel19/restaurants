/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { RestaurantEntity } from './restaurant.entity/restaurant.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlateEntity } from '../plate/plate.entity/plate.entity'; // Import PlateEntity
import { faker } from '@faker-js/faker';
import { CuisineType } from '../shared/enums/cuisine_type';
import { v4 as uuidv4 } from 'uuid';
import { PlateCategory } from '../shared/enums/plate_category';

describe('RestaurantService', () => {
  let service: RestaurantService;
  let repository: Repository<RestaurantEntity>;
  let restaurantEntities: RestaurantEntity[];
  let plateEntities: PlateEntity[]; // Declare plateEntities

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: getRepositoryToken(RestaurantEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    repository = module.get<Repository<RestaurantEntity>>(
      getRepositoryToken(RestaurantEntity),
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
      // Initialize plateEntities
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

    repository.find = jest.fn().mockResolvedValue(restaurantEntities);
    repository.findOne = jest.fn().mockResolvedValue(restaurantEntities[0]);
    repository.save = jest.fn().mockResolvedValue(restaurantEntities[0]);
    repository.remove = jest.fn().mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all restaurants with plates', async () => {
      const restaurants = await service.findAll();
      expect(restaurants).toEqual(restaurantEntities);
      expect(repository.find).toHaveBeenCalledWith({ relations: ['plates'] });
    });
  });

  describe('findOne', () => {
    it('should return a restaurant with plates if it exists', async () => {
      const restaurant = await service.findOne(restaurantEntities[0].id);
      expect(restaurant).toEqual(restaurantEntities[0]);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: restaurantEntities[0].id },
        relations: ['plates'],
      });
    });

    it('should throw BusinessLogicException if restaurant does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(uuidv4())).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new restaurant', async () => {
      const newRestaurant = {
        id: uuidv4(),
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        web: faker.image.url(),
        cuisine: CuisineType.COLOMBIAN,
        plates: [],
      };
      (repository.save as jest.Mock).mockResolvedValue(newRestaurant);

      const createdRestaurant = await service.create(newRestaurant);
      expect(createdRestaurant).toEqual(newRestaurant);
      expect(repository.save).toHaveBeenCalledWith(newRestaurant);
    });
  });

  describe('update', () => {
    it('should update an existing restaurant', async () => {
      const updatedRestaurantData = {
        id: restaurantEntities[0].id,
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        web: faker.image.url(),
        cuisine: CuisineType.COLOMBIAN,
        plates: [],
      };

      const updatedRestaurant: RestaurantEntity = {
        ...restaurantEntities[0],
        ...updatedRestaurantData,
      };

      (repository.findOne as jest.Mock).mockResolvedValue(
        restaurantEntities[0],
      );
      (repository.save as jest.Mock).mockResolvedValue(updatedRestaurant);

      const result = await service.update(
        restaurantEntities[0].id,
        updatedRestaurantData,
      );
      expect(result).toEqual(updatedRestaurant);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: restaurantEntities[0].id },
      });
      expect(repository.save).toHaveBeenCalledWith(updatedRestaurant);
    });

    it('should throw BusinessLogicException if restaurant to update does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      const updatedRestaurantData = {
        id: uuidv4(),
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        web: faker.image.url(),
        cuisine: CuisineType.COLOMBIAN,
        plates: [],
      };
      await expect(
        service.update(uuidv4(), updatedRestaurantData),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing restaurant', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(
        restaurantEntities[0],
      );
      await service.delete(restaurantEntities[0].id);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: restaurantEntities[0].id },
      });
      expect(repository.remove).toHaveBeenCalledWith(restaurantEntities[0]);
    });

    it('should throw BusinessLogicException if restaurant to delete does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.delete(uuidv4())).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
    });
  });
});
