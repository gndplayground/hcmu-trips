export enum Role {
  OPERATOR = 'OPERATOR',
  USER = 'USER',
  DRIVER = 'DRIVER',
}

export interface User {
  id: number;
  email: string;
  role: Role;
  createdAt: Date;
  isLocked: boolean;
  isDisabled: boolean;
  Customer?: Customer;
  Driver?: Driver;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  createdAt: Date;
  userId: number;
  status: string;
  lastUpdateCoords: null;
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
}

export interface Driver {
  id: number;
  name: string;
  phone: string;
  vehicleNumber: string;
  vehicleModel: string;
  userId: number;
  status: DriverStatus;
  vehicleType: string;
  lastUpdateCoords: null;
}
