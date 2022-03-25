import { LocationObject } from 'expo-location';
import Constants from 'expo-constants';
import { DateTime } from 'luxon';

const config = Constants.manifest?.extra || {};

export const login = async (username: string, password: string, vehicle: string) => {
  const formdata = new FormData();
  formdata.append('email', username);
  formdata.append('vehicle_number', vehicle);
  formdata.append('password', password);

  const response = await fetch(`${config.apiUrl}/app-login`, {
    method: 'POST',
    body: formdata,
  });
  const data = await response.json() as {
    message: string;
    code: number;
    token?: string;
  };
  if (response.status < 400) {
    if (!data.token) throw new Error('Missing token from server response');
    return data.token;
  } else {
    throw new Error(data.message);
  }
};

export const sendPosition = async (location: LocationObject, vehicle: string, token: string) => {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${token}`);

  const formdata = new FormData();
  formdata.append('', JSON.stringify({
    getFullMessage: true,
    coordinateList: [{
      carNumber: vehicle,
      drive_order_uuid: null,
      time: location.timestamp,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
    }]
  }));

  const today = DateTime.now();

  const queryParams = new URLSearchParams({
    weekday: today.toFormat('yyyy-MM-dd'),
    vehicle_id: vehicle,
    language: 'sv_sv',
  });

  const response = await fetch(`${config.apiUrl}/v1/get-drip-app-message?${queryParams.toString()}`, {
    method: 'POST',
    headers,
    body: formdata,
  });

  const data = await response.json() as {
    error?: string;
    updated_time?: string;
    notifications?: {
      original: {
        body: string;
        createdAt: string;
        updatedAt: string;
      }[],
    };
  };

  if (response.status < 400) {
    const notifications = data.notifications?.original;
    if (!Array.isArray(notifications)) throw new Error('Did not receive array of notification');
    const newNotifications = notifications
      .filter(({ createdAt, updatedAt }) => createdAt === updatedAt);
    const latestNotification = newNotifications[newNotifications.length - 1];

    return {
      notification: latestNotification,
    }
  } else {
    throw new Error(data.error || 'Unexpected error');
  }
};
