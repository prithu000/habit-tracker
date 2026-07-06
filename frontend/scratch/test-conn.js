const http = require('http');

const data = JSON.stringify({
  email: 'testuser_from_node@forge.com',
  display_name: 'Node Test',
  password: 'TestPass123!',
  password_confirm: 'TestPass123!'
});

const options = {
  hostname: '127.0.0.1',
  port: 8000,
  path: '/api/v1/auth/register/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('BODY:', body);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
  console.error(e);
});

req.write(data);
req.end();
