/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantDishService } from './restaurant-dish.service';
import { Repository } from 'typeorm';
import { RestaurantEntity } from '../restaurant/restaurant.entity/restaurant.entity';
import { DishEntity } from '../dish/dish.entity/dish.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { CuisineType } from '../shared/enums/cuisine_type';
import { DishCategory } from '../shared/enums/dish_category';

const generateRestaurant = (): RestaurantEntity => ({
  id: uuidv4(),
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  web: faker.image.url(),
  cuisine: CuisineType.COLOMBIAN,
  dishes: [],
});

const generateDish = (): DishEntity => ({
  id: uuidv4(),
  name: faker.food.dish(),
  description: faker.food.dish(),
  price: faker.number.int(),
  category: DishCategory.DESSERT,
  restaurants: [],
});

describe('RestaurantDishService', () => {
  let service: RestaurantDishService;
  let restaurantRepository: Repository<RestaurantEntity>;
  let dishRepository: Repository<DishEntity>;
  let restaurant: RestaurantEntity;
  let dish: DishEntity;
  let dishesList: DishEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantDishService,
        {
          provide: getRepositoryToken(RestaurantEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DishEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RestaurantDishService>(RestaurantDishService);
    restaurantRepository = module.get<Repository<RestaurantEntity>>(
      getRepositoryToken(RestaurantEntity),
    );
    dishRepository = module.get<Repository<DishEntity>>(
      getRepositoryToken(DishEntity),
    );
    restaurant = generateRestaurant();
    dish = generateDish();
    dishesList = [generateDish(), generateDish()];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addDishToRestaurant', () => {
    it('should add a dish to a restaurant', async () => {
      const restaurantWithDishs = { ...restaurant, dishes: [] };
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(dish);
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithDishs);
      jest
        .spyOn(restaurantRepository, 'save')
        .mockResolvedValue({ ...restaurantWithDishs, dishes: [dish] });

      const result = await service.addDishToRestaurant(restaurant.id, dish.id);
      expect(result.dishes).toHaveLength(1);
      expect(result.dishes[0]).toEqual(dish);
      expect(dishRepository.findOne).toHaveBeenCalledWith({
        where: { id: dish.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['dishes'],
      });
      expect(restaurantRepository.save).toHaveBeenCalledWith({
        ...restaurantWithDishs,
        dishes: [dish],
      });
    });

    it('should throw BusinessLogicException if dish not found', async () => {
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.addDishToRestaurant(restaurant.id, dish.id),
      ).rejects.toHaveProperty(
        'message',
        'The dish with the given id was not found',
      );
      expect(dishRepository.findOne).toHaveBeenCalledWith({
        where: { id: dish.id },
      });
      expect(restaurantRepository.findOne).not.toHaveBeenCalled();
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicException if restaurant not found', async () => {
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(dish);
      jest.spyOn(restaurantRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.addDishToRestaurant(restaurant.id, dish.id),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
      expect(dishRepository.findOne).toHaveBeenCalledWith({
        where: { id: dish.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['dishes'],
      });
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicException if the restaurant already has the dish', async () => {
      const restaurantWithExistingDish = { ...restaurant, dishes: [dish] };
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(dish);
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithExistingDish);

      await expect(
        service.addDishToRestaurant(restaurant.id, dish.id),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant already has that dish registered.',
      );
      expect(dishRepository.findOne).toHaveBeenCalledWith({
        where: { id: dish.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['dishes'],
      });
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findDishesFromRestaurant', () => {
    it('should return all dishes associated with a restaurant', async () => {
      const restaurantWithDishs = { ...restaurant, dishes: dishesList };
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithDishs);

      const result = await service.findDishesFromRestaurant(restaurant.id);
      expect(result).toEqual(dishesList);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['dishes'],
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
        relations: ['dishes'],
      });
    });
  });

  describe('findDishFromRestaurant', () => {
    it('should return a specific dish associated with a restaurant', async () => {
      const restaurantWithDishs = {
        ...restaurant,
        dishes: [dish, generateDish()],
      };
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(dish);
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithDishs);

      const result = await service.findDishFromRestaurant(
        restaurant.id,
        dish.id,
      );
      expect(result).toEqual(dish);
      expect(dishRepository.findOne).toHaveBeenCalledWith({
        where: { id: dish.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['dishes'],
      });
    });

    it('should throw BusinessLogicException if dish not found', async () => {
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.findDishFromRestaurant(restaurant.id, dish.id),
      ).rejects.toHaveProperty(
        'message',
        'The dish with the given id was not found',
      );
      expect(dishRepository.findOne).toHaveBeenCalledWith({
        where: { id: dish.id },
      });
      expect(restaurantRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicException if restaurant not found', async () => {
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(dish);
      jest.spyOn(restaurantRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.findDishFromRestaurant(restaurant.id, dish.id),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
      expect(dishRepository.findOne).toHaveBeenCalledWith({
        where: { id: dish.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['dishes'],
      });
    });

    it('should throw BusinessLogicException if the dish is not associated with the restaurant', async () => {
      const restaurantWithOtherDishs = {
        ...restaurant,
        dishes: [generateDish()],
      };
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(dish);
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithOtherDishs);

      await expect(
        service.findDishFromRestaurant(restaurant.id, dish.id),
      ).rejects.toHaveProperty(
        'message',
        'The dish with the given id is not associated to the restaurant',
      );
      expect(dishRepository.findOne).toHaveBeenCalledWith({
        where: { id: dish.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['dishes'],
      });
    });
  });

  describe('deleteDishFromRestaurant', () => {
    it('should remove a dish from a restaurant', async () => {
      const dishToDelete = generateDish();
      const restaurantWithDishToDelete = {
        ...restaurant,
        dishes: [dish, dishToDelete],
      };
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(dish);
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithDishToDelete);
      jest.spyOn(restaurantRepository, 'save').mockResolvedValue({
        ...restaurant,
        dishes: [dishToDelete],
      });

      await service.deleteDishFromRestaurant(restaurant.id, dish.id);
      expect(dishRepository.findOne).toHaveBeenCalledWith({
        where: { id: dish.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['dishes'],
      });
      expect(restaurantRepository.save).toHaveBeenCalledWith({
        ...restaurant,
        dishes: [dishToDelete],
      });
    });

    it('should throw BusinessLogicException if dish not found', async () => {
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.deleteDishFromRestaurant(restaurant.id, dish.id),
      ).rejects.toHaveProperty(
        'message',
        'The dish with the given id was not found',
      );
      expect(dishRepository.findOne).toHaveBeenCalledWith({
        where: { id: dish.id },
      });
      expect(restaurantRepository.findOne).not.toHaveBeenCalled();
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicException if restaurant not found', async () => {
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(dish);
      jest.spyOn(restaurantRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.deleteDishFromRestaurant(restaurant.id, dish.id),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
      expect(dishRepository.findOne).toHaveBeenCalledWith({
        where: { id: dish.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['dishes'],
      });
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicException if the dish is not associated with the restaurant', async () => {
      const restaurantWithOtherDishs = {
        ...restaurant,
        dishes: [generateDish()],
      };
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(dish);
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithOtherDishs);

      await expect(
        service.deleteDishFromRestaurant(restaurant.id, dish.id),
      ).rejects.toHaveProperty(
        'message',
        'The dish with the given id is not associated to the restaurant',
      );
      expect(dishRepository.findOne).toHaveBeenCalledWith({
        where: { id: dish.id },
      });
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['dishes'],
      });
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateDishesFromRestaurant', () => {
    it('should update the list of dishes for a restaurant', async () => {
      const newDishsList = [generateDish(), generateDish()];
      const restaurantWithExistingDishs = { ...restaurant, dishes: [dish] };
      jest
        .spyOn(restaurantRepository, 'findOne')
        .mockResolvedValue(restaurantWithExistingDishs);
      jest
        .spyOn(dishRepository, 'findOne')
        .mockResolvedValueOnce(newDishsList[0])
        .mockResolvedValueOnce(newDishsList[1]);
      jest
        .spyOn(restaurantRepository, 'save')
        .mockResolvedValue({ ...restaurant, dishes: newDishsList });

      await service.updateDishesFromRestaurant(
        restaurant.id,
        newDishsList.map((p) => p),
      );
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['dishes'],
      });
      expect(dishRepository.findOne).toHaveBeenCalledTimes(newDishsList.length);
      expect(restaurantRepository.save).toHaveBeenCalledWith({
        ...restaurant,
        dishes: newDishsList,
      });
    });

    it('should throw BusinessLogicException if a dish in the list is not found', async () => {
      const newDishsList = [generateDish(), generateDish()];
      jest
        .spyOn(dishRepository, 'findOne')
        .mockResolvedValueOnce(newDishsList[0])
        .mockResolvedValueOnce(null);

      await expect(
        service.updateDishesFromRestaurant(
          restaurant.id,
          newDishsList.map((p) => p),
        ),
      ).rejects.toHaveProperty(
        'message',
        'The dish with the given id was not found',
      );
      expect(dishRepository.findOne).toHaveBeenCalledTimes(newDishsList.length);
      expect(restaurantRepository.findOne).not.toHaveBeenCalled();
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicException if restaurant not found', async () => {
      const newDishsList = [generateDish()];
      jest.spyOn(dishRepository, 'findOne').mockResolvedValue(newDishsList[0]);
      jest.spyOn(restaurantRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateDishesFromRestaurant(
          restaurant.id,
          newDishsList.map((p) => p),
        ),
      ).rejects.toHaveProperty(
        'message',
        'The restaurant with the given id was not found',
      );
      expect(dishRepository.findOne).toHaveBeenCalledTimes(newDishsList.length);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: restaurant.id },
        relations: ['dishes'],
      });
      expect(restaurantRepository.save).not.toHaveBeenCalled();
    });
  });
});
