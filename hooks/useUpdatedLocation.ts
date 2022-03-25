import { useEffect, useState } from 'react';
import {
  Accuracy,
  LocationObject,
  LocationSubscription,
  useForegroundPermissions,
  watchPositionAsync,
} from 'expo-location';

const useUpdatedLocation = () => {
  const [status, requestPermission] = useForegroundPermissions();
  const [location, setLocation] = useState<LocationObject | undefined>();

  useEffect(() => {
    if (!status?.granted) return;

    let locationSubscription: LocationSubscription | undefined;
    watchPositionAsync({
      accuracy: Accuracy.BestForNavigation,
      timeInterval: 5000,
    }, (gpsLocation) => {
      setLocation(gpsLocation);
    }).then((subscription) => locationSubscription = subscription);

    return () => {
      if (locationSubscription) locationSubscription.remove();
    }
  }, [status]);

  return {
    hasPermission: !!status?.granted,
    requestPermission,
    location,
  }
};

export default useUpdatedLocation;
