import { Accuracy, LocationObject, startLocationUpdatesAsync, stopLocationUpdatesAsync } from 'expo-location';
import { scheduleNotificationAsync } from 'expo-notifications';
import { defineTask } from 'expo-task-manager';

const TASK_NAME = 'location-reporting';

const reportPositionAndNotify = async (location: LocationObject) => {
  const response = await fetch('http://192.168.14.112:3000', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(location),
  });
  const data = await response.json() as {
    notification?: {
      title: string;
      body: string;
    }
  };
  if (data.notification) {
    await scheduleNotificationAsync({
      content: {
        title: data.notification.title,
        body: data.notification.body,
      },
      trigger: {
        seconds: 1
      }
    });
  }
}

defineTask<{
  locations: LocationObject[];
}>(TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }

  const latestLocation = data.locations[data.locations.length -1];
  reportPositionAndNotify(latestLocation).catch((e) => console.error(e));
});

export const startLocationReporting = () => startLocationUpdatesAsync(TASK_NAME, {
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
});

export const stopLocationReporting = () => stopLocationUpdatesAsync(TASK_NAME);
