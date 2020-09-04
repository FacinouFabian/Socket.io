"use strict";

var _express = _interopRequireDefault(require("express"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _chalk = _interopRequireDefault(require("chalk"));

var _socket = _interopRequireDefault(require("socket.io"));

var _events = require("events");

var _moment = _interopRequireDefault(require("moment"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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
var ee = new _events.EventEmitter();
var users = {};
var games = [{
  id: 0,
  beg: "Test1",
  end: "Test1",
  players: [{
    name: "Goldenee",
    points: 0,
    state: "not ready"
  }],
  state: "waiting",
  magicNumber: null
}, {
  id: 1,
  beg: "Test2",
  end: "Test2",
  players: [{
    name: "Majdi",
    points: 0,
    state: "not ready"
  }, {
    name: "Dylan",
    points: 0,
    state: "not ready"
  }],
  state: "waiting",
  magicNumber: null
}];
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
    /*     socket.emit('game::start', {
          points: 1337,
        }) */
  });
  socket.on('game::createParty', function (payload) {
    var user = JSON.parse(payload);
    var nickname = user.nickname;
    (0, _utils.display)(_chalk["default"].green("Challenger : ".concat(nickname, " ( from ").concat(socket.id, " ) created a party!")));
    games[room] = {
      id: room,
      beg: "NEW",
      end: "NEW",
      players: [{
        name: nickname,
        points: 0,
        state: "not ready"
      }],
      state: "waiting",
      magicNumber: null
    };
    (0, _utils.display)(_chalk["default"].red(JSON.stringify(games)));
    socket.emit('game::create', {
      games: games
    });
    room = room + 1;
  });
  socket.on('game::joinParty', function (payload) {
    var data = JSON.parse(payload);
    var nickname = data.nickname,
        roomId = data.roomId;
    (0, _utils.display)(_chalk["default"].green("Challenger : ".concat(nickname, " ( from ").concat(socket.id, " ) joined ").concat(games[roomId].players[0].name, "'s party!")));
    (0, _utils.display)(_chalk["default"].red("".concat(games[roomId].players[0].name, "'s party will start!")));
    games[roomId].players.push({
      name: nickname,
      points: 0,
      state: "not ready"
    });
  });
  socket.on('game::getRooms', function () {
    socket.emit('game::rooms', {
      games: games
    });
  });
  socket.on('game::getUserParty', function (payload) {
    var data = JSON.parse(payload);
    var nickname = data.nickname;

    var _iterator = _createForOfIteratorHelper(games),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var party = _step.value;

        var _iterator2 = _createForOfIteratorHelper(party.players),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var player = _step2.value;

            if (player.name === nickname) {
              socket.emit('game::userParty', {
                party: party
              });
            } else {
              (0, _utils.display)(_chalk["default"].cyan("Cannot find player ".concat(nickname, " in a game.")));
            }
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  });
  socket.on('game::playerState', function (payload) {
    var data = JSON.parse(payload);
    var roomId = data.roomId,
        nickname = data.nickname,
        state = data.state;
    var game = games[roomId];

    var _iterator3 = _createForOfIteratorHelper(game.players),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var player = _step3.value;

        if (player.name === nickname) {
          player.state = state;
          (0, _utils.display)(_chalk["default"].blue("Player ".concat(player.name, " is ").concat(player.state, ".")));
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }

    if (game.players.length === 2) {
      game.players[0].state === "ready" && game.players[1].state === "ready" ? ee.emit('game::start', {
        roomId: roomId
      }) : (0, _utils.display)(_chalk["default"].yellowBright('Waiting for 2nd player before start.'));
    }
  });
  ee.on("game::start", function (payload) {
    var roomId = payload.roomId;
    var game = games[roomId];

    if (game.players.length === 2) {
      game.state = "started";
      game.beg = (0, _moment["default"])().format();
      (0, _utils.display)(_chalk["default"].greenBright("".concat(game.players[0].name, "'s party has started.")));
      (0, _utils.display)(_chalk["default"].green("".concat(JSON.stringify(game))));
      startGame(roomId, socket);
    } else {
      (0, _utils.display)(_chalk["default"].redBright("Cannot start ".concat(game.players[0].name, "'s party. Error: Missing player(s)")));
    }
  });
  socket.on("game::pause", function (payload) {
    var roomId = payload.roomId,
        nickname = payload.nickname;
    var game = games[roomId];

    if (game.state != "paused") {
      game.state = "paused";
      (0, _utils.display)(_chalk["default"].greenBright("".concat(game.players[0].name, "'s party has been paused by ").concat(nickname, ".")));
      (0, _utils.display)(_chalk["default"].green("".concat(JSON.stringify(game))));
    } else {
      (0, _utils.display)(_chalk["default"].redBright("".concat(game.players[0].name, "'s party is already in pause.")));
    }
  });
  socket.on("game::userMagicNumber", function (payload) {
    var roomId = payload.roomId,
        magicNumber = payload.magicNumber,
        nickname = payload.nickname;
    var game = games[roomId];
    (0, _utils.display)(_chalk["default"].redBright.underline("Received magic number ".concat(magicNumber, " from ").concat(nickname, ".")));

    if (game.magicNumber === magicNumber) {
      var _iterator4 = _createForOfIteratorHelper(game.players),
          _step4;

      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var player = _step4.value;

          if (player.name === nickname) {
            player.points = player.points + 1;
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }

      socket.emit('game::isMagicNumber', {
        response: 'Congratulations!✨ you found the magic number. 🔥'
      });
      /* ee.emit('game::finish', { roomId })  */
    } else {
      socket.emit('game::isMagicNumber', {
        response: 'Wrong answer!🙊 Try again! 😃'
      });
    }
  });
  ee.on("game::finish", function (payload) {
    var roomId = payload.roomId;
    var game = games[roomId];
    game.state = "finished";
    game.end = (0, _moment["default"])().format();
    var ranking = game.players.sort(function (player1, player2) {
      return player1.points > player2.points ? 1 : -1;
    });
    var winner = ranking[0];
    (0, _utils.display)(_chalk["default"].greenBright("".concat(game.players[0].name, "'s party has finished.")));
    (0, _utils.display)(_chalk["default"].white("".concat(winner.name, " won with ").concat(winner.points, " points !")));
    (0, _utils.display)(_chalk["default"].magenta("Ranking : ".concat(JSON.stringify(ranking))));
  });
}); // functions

var startGame = function startGame(roomId, socket) {
  var magicNumber = Math.floor(Math.random() * Math.floor(1337));
  socket.emit('game::magicNumber', {
    roomId: roomId,
    magicNumber: magicNumber
  });
};