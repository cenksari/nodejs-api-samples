const express = require('express');
const bodyParser = require('body-parser');
const basicAuthorization = require('express-basic-auth');

const app = express();

const port = process.env.PORT || 8000;
const jsonParser = bodyParser.json();
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

// Remove X-Powered-By header
app.disable('x-powered-by');

// Basic Authorization
function myBasicAuthorizer(username, password, cb) {
  if (username.startsWith('username') && password.startsWith('secret')) {
    return cb(null, true);
  }

  return cb(null, false);
}

function getUnauthorizedResponse(req) {
  return req.auth
    ? ({ code: 401, message: `Credentials ${req.auth.user}:${req.auth.password} rejected` })
    : ({ code: 401, message: 'No credentials provided' });
}

app.use(basicAuthorization({
  authorizer: myBasicAuthorizer,
  authorizeAsync: true,
  unauthorizedResponse: getUnauthorizedResponse,
}));

// Get query string parameters
app.get('/api/querystring', urlEncodedParser, (req, res) => {
  const { id, name } = req.query;

  res.send(`${id} ${name}`);
});

// User database
let users = [
  {
    id: 1,
    name: 'John',
    lastName: 'PETRUCCI',
    email: 'jpetrucci@dreamtheater.net',
  },
  {
    id: 2,
    name: 'John',
    lastName: 'MYUNG',
    email: 'jmyung@dreamtheater.net',
  },
  {
    id: 3,
    name: 'James',
    lastName: 'LABRIE',
    email: 'jlabrie@dreamtheater.net',
  },
  {
    id: 4,
    name: 'Jordan',
    lastName: 'RUDESS',
    email: 'jrudess@dreamtheater.net',
  },
];

// List users
app.get('/api/users/list', (req, res) => {
  res.json(users);
});

// Get user
app.get('/api/users/get/:id', (req, res) => {
  const { id } = req.params;

  const findUser = users.find(user => user.id === parseInt(id, 10));

  res.json(findUser);
});

// Add user
app.post('/api/users/add', jsonParser, (req, res) => {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).json({ code: 400, message: 'Invalid body' });
  }

  const user = req.body;

  users.push(user);

  res.json(users);
});

// Edit user
app.post('/api/users/edit', jsonParser, (req, res) => {
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).json({ code: 400, message: 'Invalid body' });
  }

  const {
    id,
    name,
    lastName,
    email,
  } = req.body;

  const findUser = users.find(user => user.id === parseInt(id, 10));

  findUser.name = name;
  findUser.lastName = lastName;
  findUser.email = email;

  res.json(users);
});

// Delete user
app.post('/api/users/delete/:id', (req, res) => {
  const filteredUsers = users.filter(user => user.id !== parseInt(req.params.id, 10));

  users = filteredUsers;

  res.json(users);
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server listening on port : ${server.address().port}`);
});
