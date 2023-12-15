import polyline from '@mapbox/polyline';
import * as turf from '@turf/turf';
import {Step} from '../models/trip';

export function decodeRoute(str: string) {
  return polyline.decode(str);
}

export function decodeRouteToPolyLines(str: string) {
  const r = polyline.decode(str);
  return r.map(item => {
    return {
      latitude: item[0],
      longitude: item[1],
    };
  });
}

export function locationNearLine(
  location: number[],
  lineRaw: [number, number][],
  distanceThreshold = 10,
) {
  const line = turf.lineString(lineRaw);
  const snappedPoint = turf.nearestPointOnLine(line, location);
  const distance = turf.distance(location, snappedPoint.geometry.coordinates, {
    units: 'meters',
  });

  return distance < distanceThreshold;
}

export function checkLocationInSteps(steps: Step[], location: number[]) {
  for (let i = 0; i < steps.length; i++) {
    if (locationNearLine(location, decodeRoute(steps[i].polyline.points), 20)) {
      return {
        currentStep: steps[i],
        nextStep: steps[i + 1] ? steps[i + 1] : null,
      };
    }
  }
}

export function sliceLine(
  location: [number, number],
  lineRaw: [number, number][],
) {
  try {
    const line = turf.lineString(lineRaw);
    const snappedPoint = turf.nearestPointOnLine(line, location);
    const coords = line.geometry.coordinates;
    const index = coords.findIndex(
      coord =>
        coord[0] === snappedPoint.geometry.coordinates[0] &&
        coord[1] === snappedPoint.geometry.coordinates[1],
    );
    if (index === -1) {
      return lineRaw;
    }
    return coords.slice(index);
  } catch (error) {
    console.log(error);
  }
}

export function checkLocationNearPoint(
  location: number[],
  point: number[],
  distanceThreshold = 300,
) {
  const distance = turf.distance(location, point, {
    units: 'meters',
  });

  return distance < distanceThreshold;
}
