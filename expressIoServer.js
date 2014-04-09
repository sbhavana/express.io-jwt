var express = require('express.io');

var socketio_jwt = require('socketio-jwt');

var jwt = require('jsonwebtoken');
var jwt_secret = 'foo bar big secret';

// configure express app and its login route
var app = express();

app.configure(function(){
    this.use(express.json());
    this.use(express.static(__dirname + '/public'));
});
app.post('/login', function (req, res) {
    var profile = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@doe.com',
        id: 123
    };

    // We are sending the profile inside the token
    var token = jwt.sign(profile, jwt_secret, { expiresInMinutes: 60*5 });

    res.json({token: token});
});

app.http().io();
app.io.set('authorization', socketio_jwt.authorize({
    secret: jwt_secret,
    handshake: true
}));
app.io.on('connection', function (req) {
        console.log(req.handshake.decoded_token.email, 'connected');
        req.on('ping', function (m) {
            req.emit('pong', m);
        });
    });
setInterval(function () {
    app.io.broadcast('time', Date());
}, 5000);

app.listen(9000, function () {
    console.log('listening on http://localhost:9000');
});