const http = require('http');

const hostname = '0.0.0.0';
const port = 3000;

let latestNotificationTimestamp = Date.now();

const server = http.createServer((req, res) => {
  console.log(Date.now(), 'Incoming request', req.url);
  req.on('data', (chunk) => console.log(chunk.toString('utf8')));
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  if ((Date.now() - latestNotificationTimestamp) > 10000) {
    res.end(JSON.stringify({
      notification: {
        title: 'New trip!',
        body: 'A new trip is available close to you!',
      },
    }));
    latestNotificationTimestamp = Date.now();
  } else {
    res.end(JSON.stringify({}));
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
