import { Controller } from '@nestjs/common';

import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { TripFinderService } from './trip-finder.service';
import { RmqService } from '@/rmq/rmq.service';

@Controller('trip-finder')
export class TripFinderController {
  constructor(
    private readonly rmqService: RmqService,
    private readonly tripFinderService: TripFinderService,
  ) {}

  @EventPattern('test')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('test', data);

    this.rmqService.ack(context);
  }

  @EventPattern('trip.created')
  async handleTripCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    // console.log('trip.created', data);

    const result = await this.tripFinderService.findTripDriver(data.tripId);

    // console.log('result', result);

    if (result.reject) {
      this.rmqService.reject(context);
      return;
    }

    if (result.reschedule) {
      this.rmqService.nack(context);
      return;
    }

    this.rmqService.ack(context);
  }

  @EventPattern('trip.driver.rejected')
  async handleTripDriverRejected(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const result = await this.tripFinderService.findTripDriver(data.tripId);

    console.log('result', result);

    if (result.reject) {
      this.rmqService.reject(context);
      return;
    }

    if (result.reschedule) {
      this.rmqService.nack(context);
      return;
    }

    this.rmqService.ack(context);
  }
}
