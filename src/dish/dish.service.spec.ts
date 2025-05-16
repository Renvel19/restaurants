/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { DishService } from './dish.service';
import { DishEntity } from './dish.entity/dish.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { CuisineType } from '../shared/enums/cuisine_type';
import { v4 as uuidv4 } from 'uuid';
import { RestaurantEntity } from '../restaurant/restaurant.entity/restaurant.entity';
import { DishCategory } from '../shared/enums/dish_category';

describe('DishService', () => {
  let service: DishService;
  let repository: Repository<DishEntity>;
  let dishEntities: DishEntity[];
  let restaurantEntities: RestaurantEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DishService,
        {
          provide: getRepositoryToken(DishEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<DishService>(DishService);
    repository = module.get<Repository<DishEntity>>(
      getRepositoryToken(DishEntity),
    );

    // Initialize mock data
    restaurantEntities = [
      {
        id: uuidv4(),
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        web: faker.image.url(),
        cuisine: CuisineType.COLOMBIAN,
        dishes: [],
      },
      {
        id: uuidv4(),
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        web: faker.image.url(),
        cuisine: CuisineType.COLOMBIAN,
        dishes: [],
      },
      {
        id: uuidv4(),
        name: faker.company.name(),
        address: faker.location.streetAddress(),
        web: faker.image.url(),
        cuisine: CuisineType.COLOMBIAN,
        dishes: [],
      },
    ];

    dishEntities = [
      // Initialize dishEntities
      {
        id: uuidv4(),
        name: faker.food.dish(),
        description: faker.food.dish(),
        price: faker.number.int(),
        category: DishCategory.DESSERT,
        restaurants: [restaurantEntities[0]],
      },
      {
        id: uuidv4(),
        name: faker.food.dish(),
        description: faker.food.dish(),
        price: faker.number.int(),
        category: DishCategory.DESSERT,
        restaurants: [restaurantEntities[0]],
      },
      {
        id: uuidv4(),
        name: faker.food.dish(),
        description: faker.food.dish(),
        price: faker.number.int(),
        category: DishCategory.DESSERT,
        restaurants: [restaurantEntities[0]],
      },
    ];

    // Assign dishes to restaurants
    restaurantEntities[0].dishes = [dishEntities[0], dishEntities[1]];
    restaurantEntities[1].dishes = [dishEntities[2]];

    repository.find = jest.fn().mockResolvedValue(dishEntities);
    repository.findOne = jest.fn().mockResolvedValue(dishEntities[0]);
    repository.save = jest.fn().mockResolvedValue(dishEntities[0]);
    repository.remove = jest.fn().mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all dishes with restaurants', async () => {
      const dishes = await service.findAll();
      expect(dishes).toEqual(dishEntities);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['restaurants'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a dish with its restaurant if it exists', async () => {
      const dish = await service.findOne(dishEntities[0].id);
      expect(dish).toEqual(dishEntities[0]);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: dishEntities[0].id },
        relations: ['restaurants'],
      });
    });

    it('should throw BusinessLogicException if dish does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toHaveProperty(
        'message',
        'The dish with the given id was not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new dish', async () => {
      const newDish = {
        id: uuidv4(),
        name: faker.food.dish(),
        description: faker.food.dish(),
        price: faker.number.int(),
        category: DishCategory.DESSERT,
        restaurants: [restaurantEntities[0]],
      };
      (repository.save as jest.Mock).mockResolvedValue(newDish);

      const createdDish = await service.create(newDish);
      expect(createdDish).toEqual(newDish);
      expect(repository.save).toHaveBeenCalledWith(newDish);
    });
  });

  describe('update', () => {
    it('should update an existing dish', async () => {
      const updatedDishData = {
        id: dishEntities[0].id,
        name: faker.food.dish(),
        description: faker.food.dish(),
        price: faker.number.int(),
        category: DishCategory.DESSERT,
        restaurants: [restaurantEntities[0]],
      };

      const updatedDish: DishEntity = {
        ...dishEntities[0],
        ...updatedDishData,
      };

      (repository.findOne as jest.Mock).mockResolvedValue(dishEntities[0]);
      (repository.save as jest.Mock).mockResolvedValue(updatedDish);

      const result = await service.update(dishEntities[0].id, updatedDishData);
      expect(result).toEqual(updatedDish);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: dishEntities[0].id },
      });
      expect(repository.save).toHaveBeenCalledWith(updatedDish);
    });

    it('should throw BusinessLogicException if dish to update does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      const updatedDishData = {
        id: uuidv4(),
        name: faker.food.dish(),
        description: faker.food.dish(),
        price: faker.number.int(),
        category: DishCategory.DESSERT,
        restaurants: [restaurantEntities[0]],
      };
      await expect(
        service.update('non-existent-id', updatedDishData),
      ).rejects.toHaveProperty(
        'message',
        'The dish with the given id was not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing dish', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(dishEntities[0]);
      await service.delete(dishEntities[0].id);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: dishEntities[0].id },
      });
      expect(repository.remove).toHaveBeenCalledWith(dishEntities[0]);
    });

    it('should throw BusinessLogicException if dish to delete does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.delete('non-existent-id')).rejects.toHaveProperty(
        'message',
        'The dish with the given id was not found',
      );
    });
  });
});
