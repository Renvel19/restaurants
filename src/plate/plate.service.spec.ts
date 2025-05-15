/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { PlateService } from './plate.service';
import { PlateEntity } from './plate.entity/plate.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { CuisineType } from '../shared/enums/cuisine_type';
import { v4 as uuidv4 } from 'uuid';
import { RestaurantEntity } from '../restaurant/restaurant.entity/restaurant.entity';
import { PlateCategory } from '../shared/enums/plate_category';

describe('PlateService', () => {
  let service: PlateService;
  let repository: Repository<PlateEntity>;
  let plateEntities: PlateEntity[];
  let restaurantEntities: RestaurantEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlateService,
        {
          provide: getRepositoryToken(PlateEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PlateService>(PlateService);
    repository = module.get<Repository<PlateEntity>>(
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

    repository.find = jest.fn().mockResolvedValue(plateEntities);
    repository.findOne = jest.fn().mockResolvedValue(plateEntities[0]);
    repository.save = jest.fn().mockResolvedValue(plateEntities[0]);
    repository.remove = jest.fn().mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all plates with restaurants', async () => {
      const plates = await service.findAll();
      expect(plates).toEqual(plateEntities);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['restaurants'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a plate with its restaurant if it exists', async () => {
      const plate = await service.findOne(plateEntities[0].id);
      expect(plate).toEqual(plateEntities[0]);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: plateEntities[0].id },
        relations: ['restaurants'],
      });
    });

    it('should throw BusinessLogicException if plate does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toHaveProperty(
        'message',
        'The plate with the given id was not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new plate', async () => {
      const newPlate = {
        id: uuidv4(),
        name: faker.food.dish(),
        description: faker.food.dish(),
        price: faker.number.int(),
        category: PlateCategory.DESSERT,
        restaurants: [restaurantEntities[0]],
      };
      (repository.save as jest.Mock).mockResolvedValue(newPlate);

      const createdPlate = await service.create(newPlate);
      expect(createdPlate).toEqual(newPlate);
      expect(repository.save).toHaveBeenCalledWith(newPlate);
    });
  });

  describe('update', () => {
    it('should update an existing plate', async () => {
      const updatedPlateData = {
        id: plateEntities[0].id,
        name: faker.food.dish(),
        description: faker.food.dish(),
        price: faker.number.int(),
        category: PlateCategory.DESSERT,
        restaurants: [restaurantEntities[0]],
      };

      const updatedPlate: PlateEntity = {
        ...plateEntities[0],
        ...updatedPlateData,
      };

      (repository.findOne as jest.Mock).mockResolvedValue(plateEntities[0]);
      (repository.save as jest.Mock).mockResolvedValue(updatedPlate);

      const result = await service.update(
        plateEntities[0].id,
        updatedPlateData,
      );
      expect(result).toEqual(updatedPlate);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: plateEntities[0].id },
      });
      expect(repository.save).toHaveBeenCalledWith(updatedPlate);
    });

    it('should throw BusinessLogicException if plate to update does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      const updatedPlateData = {
        id: uuidv4(),
        name: faker.food.dish(),
        description: faker.food.dish(),
        price: faker.number.int(),
        category: PlateCategory.DESSERT,
        restaurants: [restaurantEntities[0]],
      };
      await expect(
        service.update('non-existent-id', updatedPlateData),
      ).rejects.toHaveProperty(
        'message',
        'The plate with the given id was not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing plate', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(plateEntities[0]);
      await service.delete(plateEntities[0].id);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: plateEntities[0].id },
      });
      expect(repository.remove).toHaveBeenCalledWith(plateEntities[0]);
    });

    it('should throw BusinessLogicException if plate to delete does not exist', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.delete('non-existent-id')).rejects.toHaveProperty(
        'message',
        'The plate with the given id was not found',
      );
    });
  });
});
