require('dotenv').config({ override: true })

export default ({ config }) => {
  return {
    ...config,
    extra: {
      apiUrl: process.env.API_URL,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      vehicle: process.env.VEHICLE,
    },
  };
};
