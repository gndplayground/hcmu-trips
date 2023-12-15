import { ApiProperty } from '@nestjs/swagger';
import { Driver, DriverStatus, DriverType } from '@prisma/client';

export class DriverDto implements Driver {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    required: false,
  })
  updatedAt?: Date;

  @ApiProperty({
    required: false,
  })
  lastUpdateCoords: Date;

  @ApiProperty({
    required: true,
  })
  userId: number;

  @ApiProperty({
    required: false,
  })
  status: DriverStatus;

  @ApiProperty({
    required: false,
  })
  vehicleNumber: string;

  @ApiProperty({
    required: false,
  })
  vehicleModel: string;

  @ApiProperty({
    required: false,
  })
  vehicleType: DriverType;
}

export class DriverUpdateDto implements Partial<Driver> {
  @ApiProperty({
    required: false,
  })
  vehicleNumber?: string;

  @ApiProperty({
    required: false,
  })
  vehicleModel?: string;

  @ApiProperty({
    required: false,
  })
  vehicleType?: DriverType;

  @ApiProperty({
    required: false,
  })
  name?: string;

  @ApiProperty({
    required: false,
  })
  phone?: string;

  @ApiProperty({
    required: false,
  })
  status?: DriverStatus;
}

export class DriverSelfUpdateDto implements Partial<Driver> {
  @ApiProperty({
    required: false,
  })
  status?: DriverStatus;
}
