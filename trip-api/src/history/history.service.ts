import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getDriverTripHistory(
    options: { driverId: number },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const trips = p.trip.findMany({
      where: {
        driverId: options.driverId,
        status: {
          in: ['FINISHED', 'CANCELED_BY_DRIVER', 'CANCELED'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
      include: {
        TripLog: {
          where: {
            status: {
              in: ['ON_THE_WAY', 'FINISHED', 'DRIVING'],
            },
          },
        },
      },
    });
    return trips;
  }

  async getCustomerTripHistory(
    options: { customerId: number },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const trips = p.trip.findMany({
      where: {
        customerId: options.customerId,
        status: {
          in: ['FINISHED', 'CANCELED', 'CANCELED_BY_DRIVER'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
    return trips;
  }

  async getDriverEarning(
    options: { driverId: number; range: 'daily' | 'weekly' | 'monthly' },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    if (options.range === 'weekly') {
      date.setDate(date.getDate() - 7);
    } else if (options.range === 'monthly') {
      date.setDate(date.getDate() - 30);
    }

    const trips = await p.trip.findMany({
      where: {
        driverId: options.driverId,
        status: 'FINISHED',
        createdAt: {
          gte: date,
        },
      },
      select: {
        driverEarn: true,
      },
    });

    const total = trips.reduce((acc, trip) => {
      return acc + trip.driverEarn;
    }, 0);

    return {
      data: {
        total,
      },
    };
  }
}
