import { ApiProperty } from '@nestjs/swagger';
import { Customer, CustomerStatus } from '@prisma/client';

export class CustomerDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  coords: any;

  @ApiProperty()
  lastUpdateCoords: Date;
}

export class CustomerUpdateDto implements Partial<Customer> {
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
  address?: string;

  @ApiProperty({
    required: false,
  })
  status?: CustomerStatus;
}
