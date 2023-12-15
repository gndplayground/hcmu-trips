import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DriverUpdateDto } from './drivers.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async driverDetail(
    data: {
      id: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const { id } = data;

    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    return await p.driver.findUnique({
      where: {
        id,
      },
    });
  }

  async updateLocation(
    options: { driverId: number; coords: number[] },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    const { coords, driverId } = options;

    const query = Prisma.sql`
      UPDATE "Driver"
      SET "coords" = ST_SetSRID(ST_MakePoint(${coords[1]}, ${coords[0]}), 4326), "lastUpdateCoords" = NOW()
      WHERE id = ${driverId}
    `;

    await p.$executeRaw(query);

    return true;
  }

  async update(
    data: { id: number; data: DriverUpdateDto },
    as?: AsyncLocalStorage<any>,
  ) {
    const { id, data: driver } = data;

    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    return await p.driver.update({
      data: {
        ...driver,
      },
      where: {
        id,
      },
    });
  }

  async getCurrentLocation(data: { id: number }, as?: AsyncLocalStorage<any>) {
    const query = Prisma.sql`
      SELECT id, 
        ST_X("coords"::geometry) as "lng", ST_Y("coords"::geometry) as "lat"
      FROM "Driver" d
      WHERE "id" = ${data.id}
    `;

    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const result = await p.$queryRaw<
      {
        id: number;
        lng: number;
        lat: number;
      }[]
    >(query);

    return result[0];
  }
}
