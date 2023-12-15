export interface ResultLocation {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: Geometry;
  place_id: string;
  types: string[];
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface Geometry {
  bounds: Bounds;
  location: Location;
  location_type: string;
  viewport: Bounds;
}

export interface Bounds {
  northeast: Location;
  southwest: Location;
}

export interface Location {
  lat: number;
  lng: number;
}

export enum TripStatus {
  AVAILABLE = 'AVAILABLE',
  PENDING = 'PENDING',
  ON_THE_WAY = 'ON_THE_WAY',
  WAITING_FOR_CUSTOMER = 'WAITING_FOR_CUSTOMER',
  DRIVING = 'DRIVING',
  FINISHED = 'FINISHED',
  CANCELED = 'CANCELED',
  CANCELED_BY_DRIVER = 'CANCELED_BY_DRIVER',
}

export interface Driver {
  id: number;
  lastUpdateCoords: Date;
  name: string;
  phone: string;
  status: string;
  userId: number;
  vehicleModel: string;
  vehicleNumber: string;
  vehicleType: string;
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
  startLat: number;
  startLng: number;
  toLat: number;
  toLng: number;
  toAddress: string;
  driver?: Driver;
}

export enum TripDriverAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
  CANCEL = 'cancel',
  REACH_START = 'reach_start',
  REACH_TO = 'reach_to',
  BEGIN_TRIP = 'begin_trip',
}

export interface Route {
  bounds: Bounds;
  copyrights: string;
  legs: Leg[];
  overview_polyline: Polyline;
  summary: string;
  warnings: any[];
  waypoint_order: any[];
}

export interface Bounds {
  northeast: Northeast;
  southwest: Northeast;
}

export interface Northeast {
  lat: number;
  lng: number;
}

export interface Leg {
  distance: Distance;
  duration: Distance;
  end_address: string;
  end_location: Northeast;
  start_address: string;
  start_location: Northeast;
  steps: Step[];
  traffic_speed_entry: any[];
  via_waypoint: any[];
}

export interface Distance {
  text: string;
  value: number;
}

export interface Step {
  distance: Distance;
  duration: Distance;
  end_location: Northeast;
  html_instructions: string;
  polyline: Polyline;
  start_location: Northeast;
  travel_mode: string;
  maneuver?: string;
}

export interface Polyline {
  points: string;
}

export interface Place {
  business_status: string;
  formatted_address: string;
  geometry: Geometry;
  icon: string;
  icon_background_color: string;
  icon_mask_base_uri: string;
  name: string;
  photos: Array<any[]>;
  place_id: string;
  rating: number;
  reference: string;
  types: string[];
  user_ratings_total: number;
}
