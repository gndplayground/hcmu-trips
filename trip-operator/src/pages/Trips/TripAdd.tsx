import {
  Box,
  Button,
  Card,
  FormErrorMessage,
  Heading,
  IconButton,
  Input,
  Stack,
} from "@chakra-ui/react";
import React from "react";
import * as Yup from "yup";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "@components";
import GoogleMap from "google-maps-react-markers";
import { config } from "@configs";
import debounce from "lodash.debounce";
import { useCreateTrip } from "@hooks/trips";

const Point = (props: {
  lat: number;
  lng: number;
  address?: string;
  onClear: () => void;
  onSet: (p: "start" | "end") => void;
}) => {
  const { onClear, onSet, address } = props;
  return (
    <Box id="point" bg="white" w="200px" p="4" pos="relative">
      <Box display="flex" justifyContent="flex-end">
        <Box>{address}</Box>
        <Button size="xs" flexShrink={0} onClick={onClear}>
          Clear
        </Button>
      </Box>

      <Box mt="2" display="flex" gap="2">
        <Button
          size="xs"
          onClick={() => {
            onSet("start");
          }}
        >
          Set as start
        </Button>
        <Button
          size="xs"
          onClick={() => {
            onSet("end");
          }}
        >
          Set as end
        </Button>
      </Box>
    </Box>
  );
};

interface FormTripCreateData {
  name: string;
  phone: string;
  startCoords?: [number, number];
  endCoords?: [number, number];
}

const defaultProps = {
  center: {
    lat: 10.824863616860624,
    lng: 106.62824239703451,
  },
  zoom: 15,
};

const validationSchema = Yup.object<FormTripCreateData>().shape({
  name: Yup.string().required("Name is required"),
  phone: Yup.string().required("Phone is required"),
  startCoords: Yup.array()
    .of(Yup.number())
    .required("Start coords is required")
    .test(
      "not-equal",
      "Start and end coordinates must be different",
      function (value) {
        const { endCoords } = this.parent;
        return (
          !endCoords || value[0] !== endCoords[0] || value[1] !== endCoords[1]
        );
      }
    ),
  endCoords: Yup.array()
    .of(Yup.number())
    .required("End coords is required")
    .test(
      "not-equal",
      "Start and end coordinates must be different",
      function (value) {
        const { startCoords } = this.parent;
        return (
          !startCoords ||
          value[0] !== startCoords[0] ||
          value[1] !== startCoords[1]
        );
      }
    ),
});

const resolver = yupResolver(validationSchema);

export function TripAdd() {
  const navigate = useNavigate();

  const form = useForm<FormTripCreateData>({
    defaultValues: {
      name: "",
      phone: "",
      startCoords: [0, 0],
      endCoords: [0, 0],
    },
    resolver: resolver as any,
    mode: "all",
  });

  const [location, setLocation] = React.useState<{
    start?: {
      name?: string;
      formatted_address?: string;
      lat: number;
      lng: number;
      place_id?: string;
    };
    end?: {
      name?: string;
      formatted_address?: string;
      lat: number;
      lng: number;
      place_id?: string;
    };
  }>({});

  const [results, setResults] = React.useState<
    google.maps.places.PlaceResult[] | undefined
  >();

  const mapRef = React.useRef<google.maps.Map>(null);
  const mapsRef = React.useRef<typeof google.maps>(null);

  const [marker, setMarker] = React.useState<
    | {
        name?: string;
        formatted_address?: string;
        lat: number;
        lng: number;
      }
    | undefined
  >();

  const {
    handleSubmit,
    register,
    setValue,

    formState: { errors, isSubmitting },
  } = form;

  const onGoogleApiLoaded = ({
    map,
    maps,
  }: {
    map: google.maps.Map;
    maps: typeof google.maps;
  }) => {
    mapRef.current = map;
    mapsRef.current = maps;

    map.addListener("click", (mapsMouseEvent: any) => {
      if (mapsMouseEvent.domEvent.explicitOriginalTarget?.closest("#point")) {
        return;
      }
      const geo = new maps.Geocoder();

      // map.setCenter(mapsMouseEvent.latLng);

      geo.geocode({ location: mapsMouseEvent.latLng }, (results, status) => {
        if (status === "OK" && results) {
          console.log(results);
          setMarker({
            lat: mapsMouseEvent.latLng.lat(),
            lng: mapsMouseEvent.latLng.lng(),
            formatted_address: results[0].formatted_address,
          });
        } else {
          console.log("Geocoder failed due to: " + status);
        }
      });
    });
  };

  const debouncedSearch = debounce((text: string) => {
    // Perform your search logic here

    if (mapRef.current && mapsRef.current) {
      const service = new mapsRef.current.places.PlacesService(mapRef.current);
      service.findPlaceFromQuery(
        {
          query: text,
          fields: ["all"],
          locationBias: mapRef.current.getBounds(),
        },
        (
          results: google.maps.places.PlaceResult[] | null,
          status: google.maps.places.PlacesServiceStatus
        ) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setResults(results);
          }
        }
      );
    }
  }, 300); // d

  async function handleChangeSearch(e: React.ChangeEvent<HTMLInputElement>) {
    console.log(e.target.value);
    if (!e.target.value) {
      setResults(undefined);
      return;
    }
    debouncedSearch(e.target.value);
  }

  const createTrip = useCreateTrip();

  async function onSubmit(values: FormTripCreateData) {
    try {
      const { startCoords, endCoords, name, phone } = values;
      if (!startCoords || !endCoords) {
        return;
      }
      await createTrip.mutateAsync({
        outsideCustomerFullname: name,
        outsideCustomerPhone: phone,
        startAddress: location.start?.formatted_address || "",
        toAddress: location.end?.formatted_address || "",
        startCoords,
        toCoords: endCoords,
      });
      navigate({
        pathname: `/`,
      });
    } catch (error) {
      console.log(error);
    }
  }

  React.useEffect(() => {
    setValue(
      "startCoords",
      location.start ? [location.start.lat, location.start.lng] : undefined
    );
    setValue(
      "endCoords",
      location.end ? [location.end.lat, location.end.lng] : undefined
    );
  }, [location, setValue]);

  return (
    <Card px={8} py={4}>
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton
          aria-label="Back"
          onClick={() => {
            navigate({
              pathname: `/`,
            });
          }}
        >
          <FiArrowLeft />
        </IconButton>
        <Heading as="h1" size="xl" ml={4}>
          Add new trip
        </Heading>
      </Box>

      <Box as="form" mt={4} onSubmit={handleSubmit(onSubmit)}>
        <Stack w="100%" spacing={4}>
          <FormInput
            isRequired={true}
            disabled={isSubmitting}
            id="name"
            inputProps={{
              ...register("name"),
            }}
            errors={errors}
            label="Customer name"
          />
          <FormInput
            isRequired={true}
            disabled={isSubmitting}
            id="phone"
            inputProps={{
              ...register("phone"),
            }}
            errors={errors}
            label="Customer phone"
          />

          <p>
            Start: {location?.start?.name} {location?.start?.formatted_address}
          </p>
          <Box textColor="red" textStyle="xs">
            {errors.startCoords?.message}
          </Box>
          <p>
            End: {location?.end?.name} {location?.end?.formatted_address}
          </p>
          <Box textColor="red" textStyle="xs">
            {errors.endCoords?.message}
          </Box>
        </Stack>
        <Box h={600} mt={4} pos="relative">
          <Box
            pos="absolute"
            zIndex={1}
            top="2"
            left={200}
            w={600}
            bg="white"
            p="2"
          >
            <Input placeholder="Search" onChange={handleChangeSearch} />
            <Box mt="2" p="2">
              {results?.slice(0, 10).map((result) => {
                return (
                  <Box
                    mb="2"
                    key={result.place_id}
                    display="flex"
                    alignItems="center"
                  >
                    <Box>
                      {result.name} - {result.formatted_address}
                    </Box>
                    <Box display="flex" gap="2" ml="4">
                      <Button
                        size="xs"
                        onClick={() => {
                          setLocation((cur) => {
                            return {
                              ...cur,
                              start: {
                                formatted_address: result.formatted_address,
                                lat: result.geometry?.location?.lat() || 0,
                                lng: result.geometry?.location?.lng() || 0,
                                name: result.name,
                                place_id: result.place_id,
                              },
                            };
                          });
                        }}
                      >
                        Set as start
                      </Button>
                      <Button
                        size="xs"
                        onClick={() => {
                          setLocation((cur) => {
                            return {
                              ...cur,
                              end: {
                                formatted_address: result.formatted_address,
                                lat: result.geometry?.location?.lat() || 0,
                                lng: result.geometry?.location?.lng() || 0,
                                name: result.name,
                                place_id: result.place_id,
                              },
                            };
                          });
                        }}
                      >
                        Set as end
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
          <GoogleMap
            apiKey={config.GOOGLE_MAP_API_KEY}
            defaultCenter={{
              lat: defaultProps.center.lat,
              lng: defaultProps.center.lng,
            }}
            defaultZoom={defaultProps.zoom}
            onGoogleApiLoaded={onGoogleApiLoaded}
          >
            {marker && (
              <Point
                onClear={() => {
                  setMarker(undefined);
                }}
                onSet={(p: "start" | "end") => {
                  setLocation((cur) => {
                    return {
                      ...cur,
                      [p]: {
                        formatted_address: marker.formatted_address,
                        lat: marker.lat,
                        lng: marker.lng,
                      },
                    };
                  });
                }}
                address={marker.formatted_address}
                lat={marker.lat}
                lng={marker.lng}
              />
            )}
          </GoogleMap>
        </Box>
        <Box textAlign="center" mt={8}>
          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            colorScheme="blue"
            variant="outline"
          >
            Add
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
