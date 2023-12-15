import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  providers: [HistoryService],
  controllers: [HistoryController],
  imports: [PrismaModule],
})
export class HistoryModule {}
