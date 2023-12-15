import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiBearerAuth } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { Roles } from '@/auth/roles.decorator';
import { RoleEnum } from '@/user/user.dto';
import { UserDeco } from '@/auth/auth.decorator';
import { UserPayloadDto } from '@/auth/auth.dto';
import { AuthGuard } from '@/auth/auth.guard';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('driver')
  @Roles(RoleEnum.DRIVER)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  async driverTripHistory(@UserDeco() userPayload: UserPayloadDto) {
    const trips = await this.historyService.getDriverTripHistory({
      driverId: userPayload.driverId,
    });

    return {
      data: trips,
    };
  }

  @Get('customer')
  @Roles(RoleEnum.USER)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  async customerTripHistory(@UserDeco() userPayload: UserPayloadDto) {
    const trips = await this.historyService.getCustomerTripHistory({
      customerId: userPayload.customerId,
    });

    return {
      data: trips,
    };
  }
}
