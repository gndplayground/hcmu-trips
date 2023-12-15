import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomerUpdateDto } from './customers.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async updateLocation(
    options: { customerId: number; coords: number[] },
    as?: AsyncLocalStorage<any>,
  ) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );
    const { coords, customerId } = options;

    const query = Prisma.sql`
      UPDATE "Customer"
      SET "coords" = ST_SetSRID(ST_MakePoint(${coords[1]}, ${coords[0]}), 4326), "lastUpdateCoords" = NOW()
      WHERE id = ${customerId}
    `;

    await p.$executeRaw(query);

    return true;
  }

  async update(
    data: { id: number; data: CustomerUpdateDto },
    as?: AsyncLocalStorage<any>,
  ) {
    const { id, data: customer } = data;

    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    return await p.customer.update({
      data: {
        ...customer,
      },
      where: {
        id,
      },
    });
  }

  async detail(id: number, as?: AsyncLocalStorage<any>) {
    const p = PrismaService.getPrismaInstanceFromAsyncLocalStorage(
      this.prisma,
      as,
    );

    return await p.customer.findUnique({
      where: {
        id,
      },
    });
  }
}
