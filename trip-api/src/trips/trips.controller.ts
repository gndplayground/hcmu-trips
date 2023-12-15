import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiNotFoundResponse,
  getSchemaPath,
  ApiOperation,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import {
  TripCreateDto,
  TripDriverAction,
  TripDriverActionDto,
  TripDto,
  TripEstimateDto,
  TripListQueryDto,
  TripRatingDto,
  TripRouteRequestDto,
  TripSearchLocation,
} from './trip.dto';
import { TripsService } from './trips.service';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/auth/roles.decorator';
import { RoleEnum } from '@/user/user.dto';
import { UserDeco } from '@/auth/auth.decorator';
import { UserPayloadDto } from '@/auth/auth.dto';
import { AppConfig } from '@/common/config';

@Controller('trips')
export class TripsController {
  constructor(
    private tripsService: TripsService,
    private config: ConfigService<AppConfig>,
  ) {}

  @Get('test')
  async test() {
    // const trip = await this.tripsService.detail({
    //   id: 23,
    // });

    // const result = await this.tripsService.findNearbyDrivers({
    //   startCoords: [trip.start.lat, trip.start.lng],
    //   tripId: 23,
    // });

    const result = await this.tripsService.getCurrentDriverRoute({
      tripId: 25,
    });

    return {
      data: result,
    };
  }

  @Get('search-location')
  @Roles(RoleEnum.DRIVER, RoleEnum.USER)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  async searchLocation(@Query() queryParams: TripSearchLocation) {
    const { search } = queryParams;
    if (search.length < 2) {
      return {
        data: [],
      };
    }
    const result = await this.tripsService.findLocation(search);
    return {
      data: result,
    };
  }

  @Post()
  @Roles(RoleEnum.USER, RoleEnum.OPERATOR)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create trip' })
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiBody({
    type: TripCreateDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    schema: {
      properties: {
        id: {
          type: 'number',
        },
      },
    },
  })
  async create(
    @Body() body: TripCreateDto,
    @UserDeco() userPayload: UserPayloadDto,
  ) {
    const id = await this.tripsService.create({
      ...body,
      customerId: userPayload.customerId || undefined,
    });
    return {
      id,
    };
  }

  @Post('estimate')
  @Roles(RoleEnum.USER, RoleEnum.OPERATOR)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Estimate a trip' })
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiBody({
    type: TripEstimateDto,
  })
  async estimate(@Body() body: TripEstimateDto) {
    return {
      data: this.tripsService.estimateTrip({
        ...body,
      }),
    };
  }

  @Get('current')
  @Roles(RoleEnum.DRIVER, RoleEnum.USER)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  async getCurrentTrip(@UserDeco() userPayload: UserPayloadDto) {
    // const drivers = await this.tripsService.findNearbyDrivers({
    //   startCoords: [10.83005268608281, 106.6194972051061],
    //   tripId: 6,
    // });
    // console.log(drivers);
    return {
      data: await this.tripsService.getCurrentTrip({
        customerId: userPayload.customerId,
        driverId: userPayload.driverId,
      }),
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the trip',
    schema: {
      properties: {
        data: {
          properties: {
            trip: {
              $ref: getSchemaPath(TripDto),
            },
            start: {
              properties: {
                lng: {
                  type: 'number',
                },
                lat: {
                  type: 'number',
                },
              },
            },
            to: {
              properties: {
                lng: {
                  type: 'number',
                },
                lat: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Trip not found' })
  async get(@Param('id') id: number, @UserDeco() userPayload: UserPayloadDto) {
    const trip = await this.tripsService.detail({
      id,
      customerId: userPayload.customerId || undefined,
      driverId: userPayload.driverId || undefined,
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return {
      data: trip,
    };
  }

  @Post(':id/driver-action')
  @Roles(RoleEnum.DRIVER)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  async tripDriverAction(
    @Param('id') id: number,
    @Body() body: TripDriverActionDto,
    @UserDeco() userPayload: UserPayloadDto,
  ) {
    const { action } = body;

    switch (action) {
      case TripDriverAction.ACCEPT:
        await this.tripsService.driverAccept({
          id: id,
          driverId: userPayload.driverId,
          coords: body.coords,
        });
        break;
      case TripDriverAction.REJECT:
        await this.tripsService.driverReject({
          id: id,
          driverId: userPayload.driverId,
        });
        break;
      case TripDriverAction.CANCEL:
        await this.tripsService.driverCancel({
          tripId: id,
          driverId: userPayload.driverId,
          coords: body.coords,
        });
        break;
      case TripDriverAction.REACH_START:
        await this.tripsService.driverReachedStart({
          id: id,
          driverId: userPayload.driverId,
          coords: body.coords,
        });
        break;
      case TripDriverAction.REACH_TO:
        await this.tripsService.driverReachedTo({
          tripId: id,
          driverId: userPayload.driverId,
          coords: body.coords,
        });
        break;
      case TripDriverAction.BEGIN_TRIP:
        await this.tripsService.driverStartTrip({
          tripId: id,
          driverId: userPayload.driverId,
          coords: body.coords,
        });
        break;
    }
  }

  @Post(':id/rating')
  @Roles(RoleEnum.USER)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Rating trip' })
  @ApiCookieAuth()
  @ApiBearerAuth()
  async rating(
    @Param('id') id: number,
    @Body() body: TripRatingDto,
    @UserDeco() userPayload: UserPayloadDto,
  ) {
    await this.tripsService.rating({
      tripId: id,
      customerId: userPayload.customerId,
      comment: body.comment,
      rating: body.rating,
    });
  }

  @Post(':id/cancel')
  @Roles(RoleEnum.USER, RoleEnum.OPERATOR)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Cancel trip' })
  @ApiCookieAuth()
  @ApiBearerAuth()
  async tripCancel(
    @Param('id') id: number,
    @UserDeco() userPayload: UserPayloadDto,
  ) {
    await this.tripsService.cancel({
      tripId: id,
      customerId: userPayload.customerId,
    });
  }

  @Post(':id/directions')
  @Roles(RoleEnum.DRIVER)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  async getDirections(
    @Param('id') id: number,
    @UserDeco() userPayload: UserPayloadDto,
    @Body() body: TripRouteRequestDto,
  ) {
    return {
      data: await this.tripsService.getDirections({
        tripId: id,
        driverId: userPayload.driverId,
        type: body.type,
        startCoords: body.startCoords,
      }),
    };
  }

  @Get(':id/current-driver-route')
  @Roles(RoleEnum.USER, RoleEnum.OPERATOR)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  async currentDriverRoute(@Param('id') id: number) {
    const result = await this.tripsService.getCurrentDriverRoute({
      tripId: id,
    });

    return {
      data: result,
    };
  }

  @Get('')
  @Roles(RoleEnum.OPERATOR)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  async operatorTrips(
    @UserDeco() userPayload: UserPayloadDto,
    @Query() queryParams: TripListQueryDto,
  ) {
    const { limit, page, search, operatorId } = queryParams;

    const [currentPage, nextPage] = await Promise.all([
      this.tripsService.list({
        limit: limit || 10,
        page: page || 1,
        search,
        operatorId: operatorId || undefined,
      }),
      this.tripsService.list({
        limit: limit || 10,
        page: page + 1 || 2,
        search,
        operatorId: operatorId || undefined,
      }),
    ]);

    return {
      data: currentPage,
      meta: {
        hasNextPage: nextPage.length > 0,
      },
    };
  }
}
