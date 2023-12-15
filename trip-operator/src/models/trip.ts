export enum TripStatus {
  AVAILABLE = "AVAILABLE",
  PENDING = "PENDING",
  ON_THE_WAY = "ON_THE_WAY",
  WAITING_FOR_CUSTOMER = "WAITING_FOR_CUSTOMER",
  DRIVING = "DRIVING",
  FINISHED = "FINISHED",
  CANCELED = "CANCELED",
  CANCELED_BY_DRIVER = "CANCELED_BY_DRIVER",
}

export interface Trip {
  id: number;
  createdAt: string;
  customerId: number;
  driverId: number;
  startAt: null;
  endAt: null;
  pricePaid: number;
  driverEarn: number;
  distance: number;
  estimated: number;
  status: TripStatus;
  outsideCustomerFullname?: string;
  outsideCustomerPhone?: string;
  toAddress?: string;
  ratingComment?: string;
  rating?: number;
}

export enum TripDriverAction {
  ACCEPT = "accept",
  REJECT = "reject",
  CANCEL = "cancel",
  REACH_START = "reach_start",
  REACH_TO = "reach_to",
  BEGIN_TRIP = "begin_trip",
}

export interface TripWithInfo extends Trip {
  customer?: {
    id: number;
    name: string;
    phone: string;
  };
  driver?: {
    id: number;
    name: string;
    phone: string;
  };
}
