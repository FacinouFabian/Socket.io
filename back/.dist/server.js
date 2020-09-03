"use strict";

var _express = _interopRequireDefault(require("express"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _chalk = _interopRequireDefault(require("chalk"));

var _socket = _interopRequireDefault(require("socket.io"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// prelude -- loading environment variable
_dotenv["default"].config();

if ((0, _utils.isNull)(process.env.PORT)) {
  throw 'Sorry missing PORT env';
}

var port = parseInt(process.env.PORT);
var app = (0, _express["default"])();
var server = app.listen(port, function () {
  (0, _utils.display)(_chalk["default"].magenta("crossPWAGame server is running on 0.0.0.0:".concat(port)));
});
var socketio = (0, _socket["default"])(server);
var users = {};
var games = [];
var room = 0;
socketio.on('connection', function (socket) {
  // CURRENT SOCKET/PLAYER
  (0, _utils.display)(_chalk["default"].cyan("Connection opened for ( ".concat(socket.id, " )")));
  socket.on('disconnect', function () {
    var _users$socket$id;

    if ((_users$socket$id = users[socket.id]) === null || _users$socket$id === void 0 ? void 0 : _users$socket$id.nickname) {
      var nickname = users[socket.id].nickname;
      (0, _utils.display)(_chalk["default"].yellow("Goodbye ".concat(nickname)));
    }

    (0, _utils.display)(_chalk["default"].cyan("Connection closed for ( ".concat(socket.id, " )")));
  });
  socket.on('game::sendNickname', function (payload) {
    var user = JSON.parse(payload);
    var nickname = user.nickname;
    (0, _utils.display)(_chalk["default"].yellow("Here comes a new challenger : ".concat(nickname, " ( from ").concat(socket.id, " )")));
    users[socket.id] = {
      nickname: nickname
    };
    socket.emit('game::start', {
      points: 1337
    });
  });
  socket.on('game::createParty', function (payload) {
    var user = JSON.parse(payload);
    var nickname = user.nickname;
    (0, _utils.display)(_chalk["default"].green("Challenger : ".concat(nickname, " ( from ").concat(socket.id, " ) created a party!")));
    games[room] = {
      id: room,
      player1: nickname
    };
    (0, _utils.display)(_chalk["default"].red(JSON.stringify(games)));
    socket.emit('game::create', {
      games: games
    });
    room = room + 1;
  });
  socket.on('game::join', function (payload) {
    var data = JSON.parse(payload);
    var nickname = data.nickname,
        roomId = data.roomId;
    (0, _utils.display)(_chalk["default"].green("Challenger : ".concat(nickname, " ( from ").concat(socket.id, " ) joined party ").concat(roomId, "!")));
    /* games[room] = { player1: nickname } */

    /* room = room + 1 */

    /* display(chalk.red(JSON.stringify(games))) */

    /*     socket.emit('game::createRoom', {
          participants: 1337,
        }) */
  });
});