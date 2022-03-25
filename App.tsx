import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { startLocationUpdatesAsync, LocationObject, useForegroundPermissions, watchPositionAsync, stopLocationUpdatesAsync, Accuracy, LocationSubscription } from 'expo-location';
import { defineTask } from 'expo-task-manager';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const LOCATION_TASK_NAME = 'background-location-task';

defineTask<{
  locations: LocationObject[];
}>(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }

  const latestLocation = data.locations[data.locations.length -1];
  fetch('http://192.168.14.112:3000', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(latestLocation),
  }).catch((e) => console.error(e));
});

export default function App() {
  const [status, requestPermission] = useForegroundPermissions();
  const [location, setLocation] = useState<LocationObject | undefined>();

  useEffect(() => {
    if (!status?.granted) return;

    startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Accuracy.BestForNavigation,
      timeInterval: 0,
      deferredUpdatesInterval: 5000,
      deferredUpdatesDistance: 0,
      distanceInterval: 0,
      foregroundService: {
        notificationTitle: "We are monitoring your position",
        notificationBody: "We will let you know when a new trip is available",
        notificationColor: "#0000FF",
      },
    }).catch((e) => console.error(e));

    return () => {
      stopLocationUpdatesAsync(LOCATION_TASK_NAME).catch((e) => console.error(e));
    }
  }, [status]);

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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>DTR PoC driver APP</Text>
      {location && <MapView
        style={styles.mapView}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }}
        />
      </MapView>}
      {!status?.granted && <Button onPress={requestPermission} title="Give permission" />}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
  },
  mapView: {
    flex: 1,
    width: '100%',
  }
});
