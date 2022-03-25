const http = require('http');

const hostname = '0.0.0.0';
const port = 3000;

let latestNotificationTimestamp = Date.now();

const server = http.createServer((req, res) => {
  if (req.url === '/app-login') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      message: 'Success',
      code: 0,
      token: `aaa.${Buffer.from(JSON.stringify({
        exp: Math.round(Date.now() / 1000),
      })).toString('base64')}.aaa`,
    }))
  } else {
    req.on('data', (chunk) => console.log('Reported location: ', chunk.toString('utf8')));

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    if ((Date.now() - latestNotificationTimestamp) > 10000) {
      res.end(JSON.stringify({
        updated_time: '10:00',
        notifications: {
          original: [{
            body: 'A new trip is available close to you!',
            createdAt: '10:00',
            updatedAt: '10:00',
          }],
        }
      }));
      latestNotificationTimestamp = Date.now();
    } else {
      res.end(JSON.stringify({
        updated_time: '10:00',
        notifications: {
          original: [],
        }
      }));
    }
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
