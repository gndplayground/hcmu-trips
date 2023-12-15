import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { DriverStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { TripsService } from '@/trips/trips.service';
import { DriversService } from '@/drivers/drivers.service';
import { CustomersService } from '@/customers/customers.service';

@Injectable()
export class TripFinderService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject('TRIPS_SERVICE') private tripClient: ClientProxy,
    private readonly tripsService: TripsService,
    private readonly driversService: DriversService,
    private readonly customersService: CustomersService,
  ) {}

  async findTripDriver(tripId: number) {
    const trip = await this.tripsService.detail({
      id: tripId,
    });

    if (!trip.trip || trip.trip.status !== 'AVAILABLE') {
      return {
        reject: true,
      };
    }

    const drivers = await this.tripsService.findNearbyDrivers({
      startCoords: [trip.start.lat, trip.start.lng],
      tripId,
    });

    if (!drivers || drivers.length === 0) {
      return {
        reschedule: true,
      };
    }

    const randomIndex = Math.floor(Math.random() * drivers.length);

    const driver = drivers[randomIndex];

    await this.prismaService.transaction(async (ctx) => {
      await this.driversService.update(
        {
          id: driver.id,
          data: {
            status: DriverStatus.BUSY,
          },
        },
        ctx,
      );
      this.tripsService.update({
        id: tripId,
        data: {
          status: 'PENDING',
          driverId: driver.id,
        },
      });
    });

    return {
      success: true,
    };
  }
}
