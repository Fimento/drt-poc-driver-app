import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import useUpdatedLocation from './hooks/useUpdatedLocation';
import useTaskFactory from './hooks/useTask';
import { startLocationReporting, stopLocationReporting } from './tasks/locationReporting';

const useLocationReportingTask = useTaskFactory(startLocationReporting, stopLocationReporting);

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

const App = () => {
  const {
    hasPermission,
    requestPermission,
    location,
  } = useUpdatedLocation();

  useLocationReportingTask({ isReady: hasPermission });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>DTR PoC driver APP</Text>
      {location && <MapView
        style={styles.mapView}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          }}
        />
      </MapView>}
      {!hasPermission && <Button onPress={requestPermission} title="Give permission" />}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

export default App;
