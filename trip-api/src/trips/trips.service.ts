import { AsyncLocalStorage } from 'async_hooks';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  CustomerStatus,
  DriverStatus,
  Prisma,
  TripStatus,
  TripStatusLog,
} from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import { TripCreateDto, TripUpdateDto } from './trip.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { MapService } from '@/map/map.service';
import { DriverDto } from '@/drivers/drivers.dto';
import { DriversService } from '@/drivers/drivers.service';
import { CustomersService } from '@/customers/customers.service';

const PRICE_PER_KM = 8000;
const NET_PRICE = 0.75;

function getTripPrice(distance: number) {
  const fixedPrice = 25000;
  const distanceInKm = distance / 1000;
  const distanceAfterFixedPrice = Math.max(distanceInKm - 2, 0);
  const priceAfterFixedPrice = distanceAfterFixedPrice * PRICE_PER_KM;
  return fixedPrice + priceAfterFixedPrice;
}

@Injectable()
export class TripsService {
  constructor(
    private prisma: PrismaService,
    private mapService: MapService,
    private driversService: DriversService,
    private customersService: CustomersService,
    @Inject('TRIPS_SERVICE') private tripClient: ClientProxy, // private s: RmqService,
  ) {}

  async create(trip: TripCreateDto, as?: AsyncLocalStorage<any>) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    if (trip.customerId) {
      const customer = await this.customersService.detail(trip.customerId, as);

      if (!customer) {
        throw new BadRequestException('Customer not found');
      }

      if (customer.status !== CustomerStatus.AVAILABLE) {
        throw new BadRequestException('Customer not available');
      }
    }

    const est = await this.summaryTrip({
      startCoords: trip.startCoords,
      toCoords: trip.toCoords,
    });

    const query = Prisma.sql`
    INSERT INTO "Trip" ("customerId", "startCoords", "toCoords", "pricePaid", "driverEarn", "distance", "estimated", "outsideCustomerFullname", "outsideCustomerPhone", "startAddress", "toAddress")
    VALUES (${trip.customerId || null}, ST_SetSRID(ST_MakePoint(${
      trip.startCoords[1]
    }, ${trip.startCoords[0]}), 4326), ST_SetSRID(ST_MakePoint(${
      trip.toCoords[1]
    }, ${trip.toCoords[0]}), 4326), ${est.price || null}, ${
      est.price ? est.price * NET_PRICE : null
    }, ${est.distance}, ${est.duration}, ${
      trip.outsideCustomerFullname || null
    }, ${trip.outsideCustomerPhone || null}, ${trip.startAddress || null}, ${
      trip.toAddress || null
    }) RETURNING id; 
  `;

    const result = await p.transaction(async (_, prisma) => {
      const result = await prisma.$queryRaw<[{ id: number }]>(query);
      return result;
    });

    await lastValueFrom(
      this.tripClient.emit('trip.created', { tripId: result[0].id }),
    );

    return result[0].id;
  }

  async update(
    data: {
      id: number;
      data: TripUpdateDto;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const { id, data: trip } = data;

    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    return await p.trip.update({
      data: {
        ...trip,
      },
      where: {
        id,
      },
    });
  }

  async summaryTrip(data: { startCoords: number[]; toCoords: number[] }) {
    const result = await this.mapService.getDistance({
      start: data.startCoords,
      end: data.toCoords,
    });

    const row = result?.rows?.[0];

    if (result.status !== 'OK' || result.error_message || !row) {
      throw new BadRequestException(
        'Cannot estimate trip' || result.error_message,
      );
    }

    return {
      distance: row.elements[0].distance.value,
      duration: row.elements[0].duration.value,
      price: getTripPrice(row.elements[0].distance.value),
      result,
    };
  }

  async estimateTrip(data: { startCoords: number[]; toCoords: number[] }) {
    const result = await this.mapService.getDirections({
      start: data.startCoords,
      end: data.toCoords,
    });

    if (result.status !== 'OK' || result.routes.length === 0) {
      throw new BadRequestException('Cannot estimate trip');
    }

    return {
      distance: result.routes[0].legs[0].distance.value,
      duration: result.routes[0].legs[0].duration.value,
      price: getTripPrice(result.routes[0].legs[0].distance.value),
      result,
    };
  }

  async getDirections(
    data: {
      tripId: number;
      driverId: number;
      startCoords: number[];
      type: 'on_the_way' | 'driving';
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const tripDetail = await this.detail(
      {
        driverId: data.driverId,
        id: data.tripId,
      },
      as,
    );

    if (!tripDetail.trip) {
      throw new NotFoundException('Trip not found');
    }

    if (
      data.type == 'on_the_way' &&
      tripDetail.trip.status !== TripStatus.ON_THE_WAY
    ) {
      throw new BadRequestException('Trip not available for routing');
    }

    if (
      data.type == 'driving' &&
      tripDetail.trip.status !== TripStatus.DRIVING
    ) {
      throw new BadRequestException('Trip not available for routing');
    }

    const result = await this.mapService.getDirections({
      start: data.startCoords,
      end:
        data.type == 'on_the_way'
          ? [tripDetail.start.lat, tripDetail.start.lng]
          : [tripDetail.to.lat, tripDetail.to.lng],
    });

    await this.createTripLog(
      {
        status:
          data.type == 'on_the_way'
            ? TripStatusLog.ROUTE_ON_THE_WAY_CHANGED
            : TripStatusLog.ROUTE_DRIVING_CHANGED,
        tripId: data.tripId,
        driverId: data.driverId,
        coords: data.startCoords,
        route: result,
      },
      as,
    );

    return result;
  }

  async checkDriverCanAccept(
    data: { driverId: number },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const driver = await this.driversService.driverDetail(
      {
        id: data.driverId,
      },
      as,
    );

    if (!driver) {
      throw new BadRequestException('Driver not found');
    }

    const trip = await p.trip.findFirst({
      where: {
        driverId: data.driverId,
        status: {
          in: [TripStatus.ON_THE_WAY, TripStatus.DRIVING],
        },
      },
    });

    if (trip) {
      return false;
    }

    return true;
  }

  async findNearbyDrivers(
    data: { startCoords: number[]; tripId?: number },
    as?: AsyncLocalStorage<any>,
  ) {
    const { startCoords } = data;

    const maxDistance = 10000;

    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    let query = Prisma.sql`
      SELECT id, name, phone, "vehicleNumber", "vehicleModel", "userId", status, "vehicleType", "lastUpdateCoords", 
        ST_X("coords"::geometry) as "lng", ST_Y("coords"::geometry) as "lat"
      FROM "Driver" d
      WHERE ST_DWithin("coords"::geography, ST_SetSRID(ST_MakePoint(${startCoords[1]}, ${startCoords[0]}), 4326)::geography, ${maxDistance})
      LIMIT 50;
    `;

    if (data.tripId) {
      query = Prisma.sql`
      SELECT
      d."id" AS "id",
      name,
      phone,
      "vehicleNumber",
      "vehicleModel",
      "userId",
      d."status" AS status,
      "vehicleType",
      "lastUpdateCoords",
      ST_X(d."coords"::geometry) AS "lat",
      ST_Y(d."coords"::geometry) AS "lng"
    FROM
      "Driver" d
    LEFT JOIN
      "TripLog" tl ON tl."driverId" = d."id" AND tl."tripId" = ${data.tripId}
    WHERE
      ST_DWithin(d."coords"::geography, ST_SetSRID(ST_MakePoint(${startCoords[1]}, ${startCoords[0]}), 4326)::geography, ${maxDistance})
      AND d."status" = 'AVAILABLE'
      AND (tl."status" IS NULL OR (tl."status" <> 'REJECTED' AND tl."status" <> 'CANCELED_BY_DRIVER'))
    LIMIT
      50;
      `;
    }

    const result = await p.$queryRaw<DriverDto[]>(query);

    return result;
  }

  async detail(
    data: { id: number; customerId?: number; driverId?: number },
    as?: AsyncLocalStorage<any>,
  ) {
    const { id, customerId, driverId } = data;

    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const trip = await p.trip.findUnique({
      where: {
        id,
        customerId: customerId || undefined,
        driverId: driverId || undefined,
      },
    });

    if (trip) {
      const query = Prisma.sql`
      SELECT id, ST_X("startCoords"::geometry) as "startLng", ST_Y("startCoords"::geometry) as "startLat", 
      ST_X("toCoords"::geometry) as "toLng", ST_Y("toCoords"::geometry) as "toLat"
      FROM "Trip" d WHERE d.id = ${trip.id};
      `;

      const result = await p.$queryRaw<
        {
          id: number;
          startLng: number;
          startLat: number;
          toLng: number;
          toLat: number;
        }[]
      >(query);

      if (result.length > 0) {
        return {
          trip: trip,
          start: {
            lng: result[0].startLng,
            lat: result[0].startLat,
          },
          to: {
            lng: result[0].toLng,
            lat: result[0].toLat,
          },
        };
      }
    }

    return {
      trip: trip,
    };
  }

  async createTripLog(
    data: {
      tripId: number;
      status: TripStatusLog;
      driverId?: number;
      coords?: number[];
      route?: any;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const { tripId, status, driverId, coords } = data;

    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    if (coords) {
      let route = null;

      if (data.route) {
        route = JSON.stringify(data.route);
      }

      const query = Prisma.sql`
        INSERT INTO "TripLog" ("tripId" , "driverId" , "status" , "coords", "route")
        VALUES (${tripId}, ${driverId}, ${status}::"TripStatusLog", ST_SETSRID(ST_MAKEPOINT(${coords[1]}, ${coords[0]}), 4326), ${route}::jsonb); 
      `;

      await p.$executeRaw(query);
    } else {
      await p.tripLog.create({
        data: {
          tripId,
          driverId,
          status,
          route: data.route,
        },
      });
    }
  }

  async driverReject(
    data: { id: number; driverId: number },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const { id, driverId } = data;

    const trip = await p.trip.findUnique({
      where: {
        id,
      },
    });

    if (!trip) {
      throw new BadRequestException('Trip not found');
    }

    if (trip.status !== TripStatus.PENDING) {
      throw new BadRequestException('Trip not available');
    }

    if (trip.driverId !== driverId) {
      throw new BadRequestException('Driver not found');
    }

    await p.transaction(async (ctx, prisma) => {
      await prisma.trip.update({
        data: {
          driverId: null,
          status: TripStatus.AVAILABLE,
        },
        where: {
          id,
        },
      });

      await this.driversService.update(
        {
          id: driverId,
          data: {
            status: DriverStatus.AVAILABLE,
          },
        },
        ctx,
      );

      await this.createTripLog(
        {
          tripId: id,
          driverId,
          status: TripStatusLog.REJECTED,
        },
        ctx,
      );
    });

    await lastValueFrom(
      this.tripClient.emit('trip.driver.rejected', {
        tripId: trip.id,
        driverId: driverId,
      }),
    );
  }

  async driverAccept(
    data: { id: number; driverId: number; coords: number[] },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    const { id, driverId } = data;

    const trip = await p.trip.findUnique({
      where: {
        id,
      },
    });

    if (!trip) {
      throw new BadRequestException('Trip not found');
    }

    if (trip.driverId !== driverId) {
      throw new BadRequestException('Driver not found');
    }

    if (trip.status !== TripStatus.PENDING) {
      throw new BadRequestException('Trip not available');
    }

    await p.transaction(async (ctx, prisma) => {
      const can = await this.checkDriverCanAccept({ driverId }, ctx);

      if (!can) {
        throw new BadRequestException('Cannot accept trip');
      }

      await prisma.trip.update({
        data: {
          driverId,
          status: TripStatus.ON_THE_WAY,
        },
        where: {
          id,
        },
      });

      await this.driversService.update(
        {
          id: trip.driverId,
          data: {
            status: DriverStatus.BUSY,
          },
        },
        ctx,
      );

      await this.createTripLog(
        {
          tripId: id,
          driverId,
          status: TripStatusLog.ON_THE_WAY,
          coords: data.coords,
        },
        ctx,
      );
    });
  }

  async driverReachedStart(
    data: { id: number; driverId: number; coords: number[] },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const { id, driverId } = data;

    const trip = await p.trip.findUnique({
      where: {
        id,
      },
    });

    if (!trip) {
      throw new BadRequestException('Trip not found');
    }

    if (trip.driverId !== driverId) {
      throw new BadRequestException('Driver not found');
    }

    if (trip.status !== TripStatus.ON_THE_WAY) {
      throw new BadRequestException('Trip not available');
    }

    // @todo Should check if the driver near the start location
    // const turf = require('@turf/turf');

    // function isCoordinateNear(coordinate1, coordinate2, distanceThreshold) {
    //   const point1 = turf.point(coordinate1);
    //   const point2 = turf.point(coordinate2);
    //   const distance = turf.distance(point1, point2, { units: 'kilometers' });

    //   return distance <= distanceThreshold;
    // }

    // const coordinate1 = [lng1, lat1]; // Replace with actual coordinates
    // const coordinate2 = [lng2, lat2]; // Replace with actual coordinates
    // const distanceThreshold = 5; // Set the distance threshold in kilometers

    // const isNear = isCoordinateNear(
    //   coordinate1,
    //   coordinate2,
    //   distanceThreshold,
    // );
    // console.log(`Coordinate 1 is${isNear ? '' : ' not'} near Coordinate 2.`);

    await p.transaction(async (ctx, prisma) => {
      await prisma.trip.update({
        data: {
          status: TripStatus.WAITING_FOR_CUSTOMER,
        },
        where: {
          id,
        },
      });

      await this.createTripLog(
        {
          tripId: id,
          driverId,
          status: TripStatusLog.WAITING_FOR_CUSTOMER,
          coords: data.coords,
        },
        ctx,
      );
    });
  }

  async driverReachedTo(
    data: { tripId: number; driverId: number; coords: number[] },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const { tripId, driverId } = data;

    const trip = await p.trip.findUnique({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      throw new BadRequestException('Trip not found');
    }

    if (trip.driverId !== driverId) {
      throw new BadRequestException('Driver not found');
    }

    if (trip.status !== TripStatus.DRIVING) {
      throw new BadRequestException('Trip not available');
    }

    // @todo Should check if the driver near the end location

    await p.transaction(async (ctx, prisma) => {
      await prisma.trip.update({
        data: {
          status: TripStatus.FINISHED,
          endAt: new Date(),
        },
        where: {
          id: tripId,
        },
      });

      await this.driversService.update(
        {
          id: trip.driverId,
          data: {
            status: DriverStatus.OFFLINE,
          },
        },
        ctx,
      );

      if (trip.customerId) {
        await this.customersService.update(
          {
            id: trip.customerId,
            data: {
              status: CustomerStatus.AVAILABLE,
            },
          },
          ctx,
        );
      }

      await this.createTripLog(
        {
          tripId,
          driverId,
          status: TripStatusLog.FINISHED,
          coords: data.coords,
        },
        ctx,
      );
    });
  }

  async driverStartTrip(
    data: {
      tripId: number;
      driverId: number;
      coords: number[];
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const { tripId, driverId } = data;

    const trip = await p.trip.findUnique({
      where: {
        id: tripId,
        driverId,
      },
    });

    if (!trip) {
      throw new BadRequestException('Trip not found');
    }

    if (trip.status !== TripStatus.WAITING_FOR_CUSTOMER) {
      throw new BadRequestException('Trip not available');
    }

    await p.transaction(async (ctx, prisma) => {
      await prisma.trip.update({
        data: {
          status: TripStatus.DRIVING,
          startAt: new Date(),
        },
        where: {
          id: tripId,
        },
      });

      if (trip.customerId) {
        await this.customersService.update(
          {
            id: trip.customerId,
            data: {
              status: CustomerStatus.BUSY,
            },
          },
          ctx,
        );
      }

      await this.createTripLog(
        {
          tripId,
          driverId,
          status: TripStatusLog.DRIVING,
          coords: data.coords,
        },
        ctx,
      );
    });
  }

  async cancel(
    data: { tripId: number; customerId?: number },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const { tripId, customerId } = data;

    const trip = await p.trip.findUnique({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      throw new BadRequestException('Trip not found');
    }

    // operator can cancel trip
    if (customerId && trip.customerId !== customerId) {
      throw new BadRequestException('Customer not found');
    }

    if (trip.status === TripStatus.FINISHED) {
      throw new BadRequestException('Trip is finished');
    }

    p.transaction(async (ctx, prisma) => {
      await prisma.trip.update({
        data: {
          status: TripStatus.CANCELED,
        },
        where: {
          id: tripId,
        },
      });

      if (trip.customerId) {
        await this.customersService.update(
          {
            id: customerId,
            data: {
              status: CustomerStatus.AVAILABLE,
            },
          },
          ctx,
        );
      }

      await this.createTripLog(
        {
          tripId,
          status: TripStatusLog.CANCELED,
        },
        ctx,
      );

      if (trip.driverId) {
        await this.driversService.update(
          {
            id: trip.driverId,
            data: {
              status: DriverStatus.AVAILABLE,
            },
          },
          ctx,
        );
      }
    });
  }

  async rating(
    data: {
      tripId: number;
      customerId?: number;
      rating: number;
      comment: string;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const { tripId, customerId } = data;

    const trip = await p.trip.findUnique({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      throw new BadRequestException('Trip not found');
    }

    // can rating trip
    if (customerId && trip.customerId !== customerId) {
      throw new BadRequestException('Customer not found');
    }

    if (trip.status !== TripStatus.FINISHED) {
      throw new BadRequestException('Trip is not finished');
    }

    await p.trip.update({
      where: {
        id: tripId,
      },
      data: {
        rating: data.rating,
        ratingComment: data.comment,
      },
    });
  }

  async driverCancel(
    data: { tripId: number; driverId: number; coords: number[] },

    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const { tripId, driverId } = data;

    const trip = await p.trip.findUnique({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      throw new BadRequestException('Trip not found');
    }

    if (trip.driverId !== driverId) {
      throw new BadRequestException('Driver not found');
    }

    if (trip.status === TripStatus.FINISHED) {
      throw new BadRequestException('Trip is finished');
    }

    await p.transaction(async (ctx) => {
      if (trip.status === TripStatus.ON_THE_WAY) {
        await this.update(
          {
            id: tripId,
            data: {
              driverId: null,
              status: TripStatus.AVAILABLE,
            },
          },
          ctx,
        );

        await this.driversService.update(
          {
            id: trip.driverId,
            data: {
              status: DriverStatus.OFFLINE,
            },
          },
          ctx,
        );

        if (trip.customerId) {
          await this.customersService.update(
            {
              id: trip.customerId,
              data: {
                status: DriverStatus.AVAILABLE,
              },
            },
            ctx,
          );
        }

        await this.createTripLog({
          tripId,
          driverId,
          status: TripStatusLog.CANCELED_BY_DRIVER,
          coords: data.coords,
        });
      }
    });
    await lastValueFrom(
      this.tripClient.emit('trip.driver.rejected', {
        tripId: trip.id,
        driverId: driverId,
      }),
    );
  }

  async getCurrentTrip(
    data: {
      driverId?: number;
      customerId?: number;
    },
    as?: AsyncLocalStorage<any>,
  ) {
    const { driverId, customerId } = data;

    if (!driverId && !customerId) {
      throw new BadRequestException('Driver or customer id is required');
    }

    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const trip = await p.trip.findFirst({
      where: {
        driverId,
        customerId,
        status: {
          notIn: [
            TripStatus.FINISHED,
            TripStatus.CANCELED,
            TripStatus.CANCELED_BY_DRIVER,
          ],
        },
      },
      include: {
        customer: true,
        driver: true,
      },
    });

    if (!trip) {
      return null;
    }

    const query = Prisma.sql`
      SELECT
        ST_X("startCoords"::geometry) as "startLng", ST_Y("startCoords"::geometry) as "startLat",
        ST_X("toCoords"::geometry) as "toLng", ST_Y("toCoords"::geometry) as "toLat"
      FROM "Trip"
      WHERE id = ${trip.id}
    `;

    const result = await p.$queryRaw<{ lat: number; lng: number }[]>(query);

    if (result.length === 0) {
      return trip;
    }

    return {
      ...trip,
      ...result[0],
    };
  }

  async findLocation(search: string) {
    return await this.mapService.getLocation(search);
  }

  async getCurrentDriverRoute(
    data: { tripId: number },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    const { tripId } = data;
    const trip = await this.detail(
      {
        id: tripId,
      },
      as,
    );

    if (!trip.trip) {
      throw new NotFoundException('Trip not found');
    }

    if (!trip.trip.driverId) {
      throw new BadRequestException('Trip not available');
    }

    const log = await p.tripLog.findFirst({
      where: {
        tripId: tripId,
        status: {
          in: [
            TripStatusLog.ROUTE_ON_THE_WAY_CHANGED,
            TripStatusLog.ROUTE_DRIVING_CHANGED,
            TripStatusLog.ON_THE_WAY,
            TripStatusLog.DRIVING,
          ],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const driverLocation = await this.driversService.getCurrentLocation({
      id: trip.trip.driverId,
    });

    return {
      route: log?.route,
      location: driverLocation,
    };
  }

  async list(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      isDisabled?: boolean;
      isDeleted?: boolean;
      operatorId?: number;
    } = {},
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    const { limit = 10, page = 1 } = options;

    return p.trip.findMany({
      skip: Math.max(page - 1, 0) * limit,
      take: limit,
      where: {
        outsideCustomerFullname: {
          contains: options.search ? `${options.search}` : undefined,
          mode: 'insensitive',
        },

        operatorId: options.operatorId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: true,
        driver: true,
      },
    });
  }

  async test() {
    await lastValueFrom(this.tripClient.emit('test', { test: 'test' }));
  }
}
