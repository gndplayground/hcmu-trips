import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  PlaceInputType,
  TravelMode,
} from '@googlemaps/google-maps-services-js';
import { AppConfig } from '@/common/config';

@Injectable()
export class MapService {
  private client: Client;

  constructor(private config: ConfigService<AppConfig>) {
    this.client = new Client({});
  }

  async getLocation(search: string) {
    const [placeResult, geocodeResult] = await Promise.all([
      this.client.findPlaceFromText({
        params: {
          input: search,
          key: this.config.get('map').key,
          inputtype: PlaceInputType.textQuery,
          fields: ['all'],
        },
      }),
      this.client.geocode({
        params: {
          address: search,
          key: this.config.get('map').key,
          region: 'vn',
          bounds: {
            northeast: {
              lat: 10.7833365,
              lng: 106.683096,
            },
            southwest: {
              lat: 10.7832241,
              lng: 106.6829733,
            },
          },
        },
        timeout: 5000,
      }),
    ]);

    return {
      places: placeResult.data.candidates,
      geocodes: geocodeResult.data.results,
    };
  }

  async getDirections(options: { start: number[]; end: number[] }) {
    const { start, end } = options;
    const result = await this.client.directions({
      params: {
        origin: start.join(','),
        destination: end.join(','),
        key: this.config.get('map').key,
        mode: TravelMode.driving,
      },
      timeout: 5000,
    });

    return result.data;
  }

  async getDistance(options: { start: number[]; end: number[] }) {
    const { start, end } = options;
    const result = await this.client.distancematrix({
      params: {
        origins: [start.join(',')],
        destinations: [end.join(',')],
        key: this.config.get('map').key,
        mode: TravelMode.driving,
      },
      timeout: 5000,
    });

    return result.data;
  }
}
