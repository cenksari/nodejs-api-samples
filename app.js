const path = require('path');
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
app.use(basicAuthorization({
    authorizer: myBasicAuthorizer,
    authorizeAsync: true,
    unauthorizedResponse: getUnauthorizedResponse
}))

function myBasicAuthorizer(username, password, cb) {
    if (username.startsWith('username') && password.startsWith('secret')) {
        return cb(null, true);
    }
    else {
        return cb(null, false);
    }
}

function getUnauthorizedResponse(req) {
    return req.auth
        ? ('Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
        : 'No credentials provided'
}

// Get query string parameters
app.get('/api/querystring', urlEncodedParser, (req, res) => {
    const id = req.query['id'];
    const name = req.query['name'];

    res.send(id + ' ' + name);
});

// User database
let users = [
    {
        "id": 1,
        "name": "John",
        "lastName": "PETRUCCI",
        "email": "jpetrucci@dreamtheater.net"
    },
    {
        "id": 2,
        "name": "John",
        "lastName": "MYUNG",
        "email": "jmyung@dreamtheater.net"
    },
    {
        "id": 3,
        "name": "James",
        "lastName": "LABRIE",
        "email": "jlabrie@dreamtheater.net"
    },
    {
        "id": 3,
        "name": "Jordan",
        "lastName": "RUDESS",
        "email": "jrudess@dreamtheater.net"
    }
];

// List users
app.get('/api/users/list', (req, res) => {
    res.json(users);
});

// Get user
app.get('/api/users/get/:id', (req, res) => {
    const id = req.params.id;

    const selectedUser = users.filter(function (user) {
        return user.id == id
    });

    res.json(selectedUser);
});

// Add user
app.post('/api/users/add', jsonParser, (req, res) => {
    if (!req.body || req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.sendStatus(400);
    }

    const user = req.body;

    users.push(user);

    res.json(users);
});

// Edit user
app.post('/api/users/edit', jsonParser, (req, res) => {
    if (!req.body || req.body.constructor === Object && Object.keys(req.body).length === 0) {
        return res.sendStatus(400);
    }

    const id = req.body.id;
    const name = req.body.name;

    for (let i in users) {
        if (users[i].id == id) {
            users[i].name = name;
            break;
        }
    }

    res.json(users);
});

// Delete user
app.post('/api/users/delete/:id', (req, res) => {
    const id = req.params.id;

    const filteredUsers = users.filter(function (user) {
        return user.id != id
    });

    users = filteredUsers;

    res.json(users);
});

// Start server
const server = app.listen(port, function () {
    console.log('Server listening on port : ' + server.address().port);
});