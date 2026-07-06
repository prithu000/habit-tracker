const http = require('http');

// First, get a token by logging in
const loginData = JSON.stringify({
  email: 'testuser_from_node@forge.com',
  password: 'TestPass123!'
});

const loginOptions = {
  hostname: '127.0.0.1',
  port: 8000,
  path: '/api/v1/auth/login/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const reqLogin = http.request(loginOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const response = JSON.parse(body);
    const token = response.data.access;
    console.log('Got Auth Token:', token ? 'YES' : 'NO');
    if (token) {
      createRoutine(token);
    }
  });
});

reqLogin.write(loginData);
reqLogin.end();

function createRoutine(token) {
  const routineData = JSON.stringify({
    name: "GYM",
    description: "do gymnasium",
    icon: "📋",
    color: "#6254f8",
    time_of_day: "any",
    schedule_type: "daily",
    is_active: true
  });

  const options = {
    hostname: '127.0.0.1',
    port: 8000,
    path: '/api/v1/routines/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(routineData),
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('RESPONSE:', body);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.write(routineData);
  req.end();
}
