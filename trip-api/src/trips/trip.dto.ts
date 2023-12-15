import {
  $Enums,
  Trip as PrismaTrip,
  TripStatus as PTripStatus,
} from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  IsNumber,
  IsOptional,
  Min,
  IsIn,
  IsString,
  MinLength,
  IsInt,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CustomerDto } from '@/user/user.dto';
import { DriverDto } from '@/drivers/drivers.dto';
import { TransformNumber } from '@/common/transforms';

export type TripStatus = PTripStatus;

export class TripDto implements PrismaTrip {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: 1 })
  customerId: number | null;

  @ApiProperty({ example: 1 })
  driverId: number | null;

  @ApiProperty({ example: new Date() })
  startAt: Date | null;

  @ApiProperty({ example: new Date() })
  endAt: Date | null;

  @ApiProperty({
    enum: $Enums.TripStatus,
    required: false,
  })
  status: TripStatus;

  @ApiProperty({ example: 100 })
  pricePaid: number | null;

  @ApiProperty()
  driverEarn: number | null;

  @ApiProperty({ type: () => CustomerDto })
  customer?: CustomerDto;

  @ApiProperty({ type: () => DriverDto })
  driver?: DriverDto;

  @ApiProperty()
  estimated: number | null;

  @ApiProperty()
  distance: number | null;

  outsideCustomerFullname: string;
  outsideCustomerPhone: string;

  rating: number;
  ratingComment: string;

  operatorId: number | null;

  @ApiProperty()
  startAddress: string | null;

  @ApiProperty()
  toAddress: string | null;
}

export class TripEstimateRequestDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  startCoords: number[];

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  toCoords: number[];
}

export class TripCreateDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  customerId?: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  startCoords: number[];

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  toCoords: number[];

  @ApiProperty({ required: false })
  @IsOptional()
  outsideCustomerFullname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  outsideCustomerPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  startAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  toAddress?: string;
}

export class TripEstimateDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  startCoords: number[];

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  toCoords: number[];
}

export class TripUpdateDto implements Partial<TripDto> {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  customerId?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  driverId?: number;

  @ApiProperty({
    enum: $Enums.TripStatus,
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values($Enums.TripStatus))
  status?: $Enums.TripStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @ApiProperty({ required: false })
  pricePaid?: number;

  @ApiProperty({ required: false })
  startAt?: Date;

  @ApiProperty({ required: false })
  endAt?: Date;
}

export const TripDriverAction = {
  ACCEPT: 'accept',
  REJECT: 'reject',
  CANCEL: 'cancel',
  REACH_START: 'reach_start',
  BEGIN_TRIP: 'begin_trip',
  REACH_TO: 'reach_to',
};

export class TripDriverActionDto {
  @ApiProperty({
    enum: TripDriverAction,
  })
  @IsIn(Object.values(TripDriverAction))
  action: (typeof TripDriverAction)[keyof typeof TripDriverAction];

  @ApiProperty({})
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  coords: number[];
}

export class TripRouteRequestDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  startCoords: number[];

  @IsIn(['on_the_way', 'driving'])
  @IsNotEmpty()
  @ApiProperty({ enum: ['on_the_way', 'driving'] })
  type: 'on_the_way' | 'driving';
}

export class TripSearchLocation {
  @ApiProperty({ example: 'Hanoi' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  search: string;
}

export class PaginationDto {
  @Transform((value) => parseInt(value.value))
  @IsInt()
  @IsOptional()
  page?: number;

  @Transform((value) => parseInt(value.value))
  @IsIn([10, 20, 50, 100])
  @IsOptional()
  limit?: number;

  @IsOptional()
  search?: string;
}

export class TripListQueryDto extends PaginationDto {
  @TransformNumber()
  @IsOptional()
  operatorId?: number;
}

export class TripRatingDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @IsInt()
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
