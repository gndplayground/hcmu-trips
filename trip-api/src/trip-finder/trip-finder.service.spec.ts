import { Test, TestingModule } from '@nestjs/testing';
import { TripFinderService } from './trip-finder.service';

describe('TripFinderService', () => {
  let service: TripFinderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TripFinderService],
    }).compile();

    service = module.get<TripFinderService>(TripFinderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
