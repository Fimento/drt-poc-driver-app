import { Accuracy, LocationObject, startLocationUpdatesAsync, stopLocationUpdatesAsync } from 'expo-location';
import { scheduleNotificationAsync } from 'expo-notifications';
import { defineTask } from 'expo-task-manager';
import Constants from 'expo-constants';
import { Buffer } from 'buffer';
import { DateTime } from 'luxon';

import { login, sendPosition } from '../apiClient';

const config = Constants.manifest?.extra || {};
const TASK_NAME = 'location-reporting';

const ref: {
  token: string | null;
  expiryDate: DateTime | null;
  routeId: string | null,
} = {
  token: null,
  expiryDate: null,
  routeId: null,
};

const getTokenExpiryDate = (token: string) => {
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('ascii'));
  return DateTime.fromSeconds(payload.exp);
}

const reportPositionAndNotify = async (location: LocationObject) => {
  if (
    !config.username
    || !config.password
    || !config.vehicle
  ) throw new Error('Missing required environment variables');

  if (
    !ref.token
    || !ref.expiryDate
    || DateTime.now() >= ref.expiryDate.plus({ minutes: 5 })
  ) {
    ref.token = await login(config.username, config.password, config.vehicle);
    ref.expiryDate = getTokenExpiryDate(ref.token);
  }
  const { notification, routeId } = await sendPosition(location, config.vehicle, ref.token, ref.routeId);
  if (routeId) ref.routeId = routeId;

  if (notification) {
    await scheduleNotificationAsync({
      content: {
        title: 'New trip!',
        body: notification.body,
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
