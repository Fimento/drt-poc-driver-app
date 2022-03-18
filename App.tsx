import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { getCurrentPositionAsync, LocationObject, useBackgroundPermissions } from 'expo-location';

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
    <View style={styles.container}>
      <Text>DTR PoC driver APP</Text>
      {location && <Text>{JSON.stringify(location)}</Text>}
      {!status?.granted && <Button onPress={requestPermission} title="Give permission" />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
