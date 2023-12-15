import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { DriverDto, DriverSelfUpdateDto } from './drivers.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { UserDeco } from '@/auth/auth.decorator';
import { UserPayloadDto } from '@/auth/auth.dto';
import { RoleEnum, UpdateUserLocationDto } from '@/user/user.dto';
import { Roles } from '@/auth/roles.decorator';

@Controller('drivers')
export class DriversController {
  constructor(private driverService: DriversService) {}

  @Put('location')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.DRIVER)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateUserLocationDto,
  })
  async updateLocation(
    @Body() body: UpdateUserLocationDto,
    @UserDeco() userPayload: UserPayloadDto,
  ): Promise<void> {
    if (!userPayload.driverId) {
      throw new NotFoundException('User not found');
    }
    if (
      await this.driverService.updateLocation({
        coords: body.coords,
        driverId: userPayload.driverId,
      })
    ) {
      return;
    }
    throw new NotFoundException('User not found');
  }

  @Get('me')
  @Roles(RoleEnum.DRIVER)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        data: {
          $ref: getSchemaPath(DriverDto),
        },
      },
    },
  })
  async getMe(@UserDeco() userPayload: UserPayloadDto) {
    if (!userPayload.driverId) {
      throw new NotFoundException('User not found');
    }
    const driver = await this.driverService.driverDetail({
      id: userPayload.driverId,
    });
    if (!driver) {
      throw new NotFoundException('User not found');
    }
    return {
      data: driver,
    };
  }

  @Put('me/status')
  @Roles(RoleEnum.DRIVER)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiBody({
    type: DriverSelfUpdateDto,
  })
  async updateStatus(
    @Body() update: DriverSelfUpdateDto,
    @UserDeco() userPayload: UserPayloadDto,
  ): Promise<void> {
    await this.driverService.update({
      id: userPayload.driverId,
      data: {
        status: update.status,
      },
    });
  }
}
