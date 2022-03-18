import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { getCurrentPositionAsync, LocationObject, useBackgroundPermissions } from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [status, requestPermission] = useBackgroundPermissions();
  const [location, setLocation] = useState<LocationObject | undefined>();

  useEffect(() => {
    if (!status?.granted) return;

    const refreshLocation = async () => {
      const gpsLocation = await getCurrentPositionAsync();
      setLocation(gpsLocation);
    };

    const intervalId = setInterval(refreshLocation, 5000);

    return () => {
      clearInterval(intervalId);
    };
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
