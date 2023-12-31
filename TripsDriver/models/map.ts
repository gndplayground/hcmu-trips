export interface DirectionResponse {
  geocoded_waypoints: GeocodedWaypoint[];
  routes: Route[];
  status: string;
}

export interface GeocodedWaypoint {
  geocoder_status: string;
  place_id: string;
  types: string[];
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
