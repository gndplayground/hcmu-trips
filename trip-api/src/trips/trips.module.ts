import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { MapModule } from '@/map/map.module';
import { RmqModule } from '@/rmq/rmq.module';
import { DriversModule } from '@/drivers/drivers.module';
import { CustomersModule } from '@/customers/customers.module';

@Module({
  providers: [TripsService],
  exports: [TripsService],
  imports: [
    PrismaModule,
    MapModule,
    DriversModule,
    CustomersModule,
    RmqModule.register({ name: 'TRIPS_SERVICE' }),
  ],
  controllers: [TripsController],
})
export class TripsModule {}
