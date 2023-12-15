import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import {
  Role as PRole,
  User,
  Customer,
  Driver,
  CustomerStatus as PCustomerStatus,
  $Enums,
} from '@prisma/client';
import { Exclude } from 'class-transformer';
import { DriverDto } from '@/drivers/drivers.dto';

export type Role = PRole;

export const RoleEnum = $Enums.Role;

export type CustomerStaus = PCustomerStatus;
export type DriverStatus = $Enums.DriverStatus;
export type DriverType = $Enums.DriverType;

export class UpdateUserLocationDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @ApiProperty({ type: [Number] })
  coords: number[];
}

export class CustomerDto implements Customer {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  address: string;

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
    required: true,
  })
  status: CustomerStaus;
}

export class UserDto implements User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: Role;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  createdAt: Date;

  @Exclude()
  password: string;

  seed: string;

  @ApiProperty({
    required: false,
  })
  isDisabled: boolean;

  @ApiProperty({
    required: false,
  })
  isLocked: boolean;

  @ApiProperty({
    required: false,
    type: CustomerDto,
  })
  Customer?: Customer;

  @ApiProperty({
    required: false,
    type: DriverDto,
  })
  Driver?: Driver;
}

export class UserCreateDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  role: Role;
}

export class UserEditDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  password?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  role?: Role;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  isDisabled?: boolean;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  isBlocked?: boolean;
}

export class UserHideSensitiveDto implements Omit<User, 'password' | 'seed'> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: Role;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  createdAt: Date;

  customer?: Customer;
  driver?: Driver;

  @ApiProperty({
    required: false,
  })
  isDisabled: boolean;

  @ApiProperty({
    required: false,
  })
  isLocked: boolean;
}

export class UserChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @Min(6)
  newPassword: string;
}
