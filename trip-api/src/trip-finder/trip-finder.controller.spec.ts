import { Test, TestingModule } from '@nestjs/testing';
import { TripFinderController } from './trip-finder.controller';

describe('TripFinderController', () => {
  let controller: TripFinderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripFinderController],
    }).compile();

    controller = module.get<TripFinderController>(TripFinderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
