import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MapService } from './map.service';

@Module({
  providers: [MapService],
  exports: [MapService],
  imports: [ConfigModule],
})
export class MapModule {}
