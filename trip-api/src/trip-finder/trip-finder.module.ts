import { Module } from '@nestjs/common';
import { TripFinderController } from './trip-finder.controller';
import { TripFinderService } from './trip-finder.service';
import { RmqModule } from '@/rmq/rmq.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { TripsModule } from '@/trips/trips.module';
import { DriversModule } from '@/drivers/drivers.module';
import { CustomersModule } from '@/customers/customers.module';

@Module({
  imports: [
    RmqModule.register({ name: 'TRIPS_SERVICE' }),
    PrismaModule,
    TripsModule,
    DriversModule,
    CustomersModule,
  ],
  controllers: [TripFinderController],
  providers: [TripFinderService],
})
export class TripFinderModule {}
