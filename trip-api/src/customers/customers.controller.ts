import {
  Body,
  Controller,
  NotFoundException,
  Put,
  UseGuards,
} from '@nestjs/common';

import { ApiCookieAuth, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { RoleEnum, UpdateUserLocationDto } from '@/user/user.dto';
import { UserPayloadDto } from '@/auth/auth.dto';
import { UserDeco } from '@/auth/auth.decorator';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/auth/roles.decorator';

@Controller('customers')
export class CustomersController {
  constructor(private customerService: CustomersService) {}

  @Put('location')
  @Roles(RoleEnum.USER)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateUserLocationDto,
  })
  async updateLocation(
    @Body() body: UpdateUserLocationDto,
    @UserDeco() userPayload: UserPayloadDto,
  ): Promise<void> {
    if (!userPayload.customerId) {
      throw new NotFoundException('User not found');
    }
    if (
      await this.customerService.updateLocation({
        coords: body.coords,
        customerId: userPayload.customerId,
      })
    ) {
      return;
    }
    throw new NotFoundException('User not found');
  }
}
