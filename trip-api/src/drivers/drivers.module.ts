import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  providers: [DriversService],
  exports: [DriversService],
  imports: [PrismaModule],
  controllers: [DriversController],
})
export class DriversModule {}
