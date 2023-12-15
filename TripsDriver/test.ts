import PolylineDecoder from '@mapbox/polyline';
import * as turf from '@turf/turf';
import {Step} from './models/map';

export function decodeRoute(str: string) {
  return PolylineDecoder.decode(str);
}

export const mock = {
  data: {
    geocoded_waypoints: [
      {
        geocoder_status: 'OK',
        place_id: 'ChIJ4e9ibdcrdTER5LHJbw_FAK0',
        types: ['street_address'],
      },
      {
        geocoder_status: 'OK',
        place_id: 'ChIJ1S5FpoIrdTERNQlMgQRdrz8',
        types: ['establishment', 'food', 'point_of_interest', 'restaurant'],
      },
    ],
    routes: [
      {
        bounds: {
          northeast: {
            lat: 10.8300499,
            lng: 106.6254276,
          },
          southwest: {
            lat: 10.8272011,
            lng: 106.6191265,
          },
        },
        copyrights: 'Map data ©2023',
        legs: [
          {
            distance: {
              text: '0.9 km',
              value: 903,
            },
            duration: {
              text: '3 mins',
              value: 159,
            },
            end_address:
              'RJH9+XVR, Phan Văn Hớn, Tân Thới Nhất, Quận 12, Thành phố Hồ Chí Minh, Vietnam',
            end_location: {
              lat: 10.8300499,
              lng: 106.6194962,
            },
            start_address:
              '1/24 Tổ 29 KP6, Đông Hưng Thuận, Quận 12, Thành phố Hồ Chí Minh, Vietnam',
            start_location: {
              lat: 10.8272011,
              lng: 106.6254276,
            },
            steps: [
              {
                distance: {
                  text: '15 m',
                  value: 15,
                },
                duration: {
                  text: '1 min',
                  value: 2,
                },
                end_location: {
                  lat: 10.8273068,
                  lng: 106.6253455,
                },
                html_instructions:
                  'Head <b>northwest</b> on <b>Trường Chinh</b> toward <b>Phan Văn Hớn</b>',
                polyline: {
                  points: '_uaaA}gxiSUN',
                },
                start_location: {
                  lat: 10.8272011,
                  lng: 106.6254276,
                },
                travel_mode: 'DRIVING',
              },
              {
                distance: {
                  text: '0.7 km',
                  value: 708,
                },
                duration: {
                  text: '2 mins',
                  value: 99,
                },
                end_location: {
                  lat: 10.8285448,
                  lng: 106.6191265,
                },
                html_instructions:
                  'Turn <b>left</b> at Tủ Điện Nhựa Chống Thấm onto <b>Phan Văn Hớn</b><div style="font-size:0.9em">Pass by CÔNG TY TNHH BIOGREEN VIỆT NAM (on the left)</div>',
                maneuver: 'turn-left',
                polyline: {
                  points:
                    'uuaaAmgxiSa@ZR^FVBP?HAB?DCPMv@UpBQvAEXSdBS~A?@G`@Mv@a@bDCLG`@QvAGb@M~@CNYpB',
                },
                start_location: {
                  lat: 10.8273068,
                  lng: 106.6253455,
                },
                travel_mode: 'DRIVING',
              },
              {
                distance: {
                  text: '0.2 km',
                  value: 172,
                },
                duration: {
                  text: '1 min',
                  value: 48,
                },
                end_location: {
                  lat: 10.8300275,
                  lng: 106.6195653,
                },
                html_instructions:
                  'Turn <b>right</b> at TTPsolutions onto <b>Minh Phụng</b><div style="font-size:0.9em">Pass by Nhà Trọng (on the right)</div>',
                maneuver: 'turn-right',
                polyline: {
                  points: 'k}aaAq`wiSqAUICSE[GWGk@KyA[',
                },
                start_location: {
                  lat: 10.8285448,
                  lng: 106.6191265,
                },
                travel_mode: 'DRIVING',
              },
              {
                distance: {
                  text: '8 m',
                  value: 8,
                },
                duration: {
                  text: '1 min',
                  value: 10,
                },
                end_location: {
                  lat: 10.8300499,
                  lng: 106.6194962,
                },
                html_instructions:
                  'Turn <b>left</b> at Diễm Bún bò-phở bò<div style="font-size:0.9em">Restricted usage road</div>',
                maneuver: 'turn-left',
                polyline: {
                  points: 'ufbaAicwiSCL',
                },
                start_location: {
                  lat: 10.8300275,
                  lng: 106.6195653,
                },
                travel_mode: 'DRIVING',
              },
            ],
            traffic_speed_entry: [],
            via_waypoint: [],
          },
        ],
        overview_polyline: {
          points: '_uaaA}gxiSw@j@R^FVBZAHy@rGm@`FkBhN]`C{AYsBa@yA[CL',
        },
        summary: 'Phan Văn Hớn',
        warnings: [],
        waypoint_order: [],
      },
    ],
    status: 'OK',
  },
};

export function locationNearLine(
  location: number[],
  lineRaw: [number, number][],
  distanceThreshold = 0.1,
) {
  const line = turf.lineString(lineRaw);
  const snappedPoint = turf.nearestPointOnLine(line, location);
  const distance = turf.distance(location, snappedPoint.geometry.coordinates, {
    units: 'kilometers',
  });
  console.log('locationNearLine', distance, distance < distanceThreshold);
  return distance < distanceThreshold;
}

export function checkLocationInSteps(steps: Step[], location: number[]) {
  for (let i = 0; i < steps.length; i++) {
    console.log('checkLocationInSteps', i);
    if (locationNearLine(location, decodeRoute(steps[i].polyline.points))) {
      console.log('checkLocationInSteps', i);
    }
  }
  // for (let i = 0; i < steps.length; i++) {
  //   if (
  //     (locationNearLine(location, decodeRoute(steps[i].polyline.points)), 0.05)
  //   ) {
  //     return {
  //       currentStep: steps[i],
  //       nextStep: steps[i + 1] ? steps[i + 1] : null,
  //     };
  //   }
  // }
}

checkLocationInSteps(
  mock.data.routes[0].legs[0].steps,
  [10.827249710165077, 106.62528898647534],
);
