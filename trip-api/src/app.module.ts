import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import config from './common/config';
import { JwtStrategy } from './auth/jwt.strategy';
import { TripsModule } from './trips/trips.module';
import { MapModule } from './map/map.module';
import { CustomersModule } from './customers/customers.module';
import { DriversModule } from './drivers/drivers.module';
import { TripFinderModule } from './trip-finder/trip-finder.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    TripsModule,
    MapModule,
    CustomersModule,
    DriversModule,
    TripFinderModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
