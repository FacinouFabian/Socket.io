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

var gamesObject = {
  MagicNumber: [],
  QuickWord: [],
  WordAndFurious: []
}; // prelude -- loading environment variable

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
  name: 'MagicNumber',
  description: 'MagicNumber Game',
  likes: 72
}, {
  id: 1,
  name: 'QuickWord',
  description: 'QuickWord Game',
  likes: 100
}, {
  id: 3,
  name: 'WordAndFurious',
  description: 'WordAndFurious Game',
  likes: 56
}];
var room = 0;
/**
 * @description Display a message when a connection has been initialised
 * @return {void}
*/

socketio.on('connection', function (socket) {
  // CURRENT SOCKET/PLAYER
  (0, _utils.display)(_chalk["default"].cyan("Connection opened for ( ".concat(socket.id, " )")));
  /* ################################# EXTERNAL EVENTS ################################# */

  /**
   * @description Display a goodbye message when connection closes
   * @return {void}
  */

  socket.on('disconnect', function () {
    var _users$socket$id;

    if ((_users$socket$id = users[socket.id]) === null || _users$socket$id === void 0 ? void 0 : _users$socket$id.nickname) {
      var nickname = users[socket.id].nickname;
      (0, _utils.display)(_chalk["default"].yellow("Goodbye ".concat(nickname)));
    }

    (0, _utils.display)(_chalk["default"].cyan("Connection closed for ( ".concat(socket.id, " )")));
  });
  /**
   * @description Set a new user to the Users Array
   * @return {void}
  */

  socket.on('game::sendNickname', function (payload) {
    var user = JSON.parse(payload);
    var nickname = user.nickname;
    (0, _utils.display)(_chalk["default"].yellow("Here comes a new challenger : ".concat(nickname, " ( from ").concat(socket.id, " )")));
    users[socket.id] = {
      nickname: nickname
    };
  });
  /**
   * @description Create a new game for a user (the user will be the owner of the game) (in Register.tsx handleCreateParty)
   * @return {void}
  */

  socket.on('game::createParty', function (payload) {
    var data = JSON.parse(payload);
    var nickname = data.nickname,
        gameType = data.gameType;
    (0, _utils.display)(_chalk["default"].green("Challenger : ".concat(nickname, " ( from ").concat(socket.id, " ) created a party!"))); // create a new game with the user (the update)

    gamesObject[gameType][room] = {
      id: room,
      beg: "",
      end: "",
      players: [{
        name: nickname,
        points: 0,
        state: "not ready"
      }],
      state: "waiting",
      magicNumber: null,
      haveBeenStarted: false,
      isEnded: false,
      round: 0,
      type: gameType
    }; // increment the index for the next created game

    room = room + 1;
  });
  /**
   * @description Make a user join a game (in Register.tsx handleJoinParty)
   * @return {void}
  */

  socket.on('game::joinParty', function (payload) {
    var data = JSON.parse(payload);
    var nickname = data.nickname,
        roomId = data.roomId,
        gameType = data.gameType;
    (0, _utils.display)(_chalk["default"].green("Challenger : ".concat(nickname, " ( from ").concat(socket.id, " ) joined ").concat(gamesObject[gameType][roomId].players[0].name, "'s party!")));
    (0, _utils.display)(_chalk["default"].red("".concat(gamesObject[gameType][roomId].players[0].name, "'s party will start!"))); // add the second user to the game

    gamesObject[gameType][roomId].players.push({
      name: nickname,
      points: 0,
      state: "not ready"
    });
    ee.emit('game::start', {
      roomId: roomId,
      gameType: gameType
    });
  });
  /**
   * @description Send all partys (for Rooms.tsx)
   * @return {void}
  */

  socket.on('game::getRooms', function () {
    var partys = gamesObject.MagicNumber.concat(gamesObject.QuickWord).concat(gamesObject.WordAndFurious);
    socket.emit('game::rooms', {
      partys: partys
    });
  });
  /**
   * @description Send all games to the hub
   * @return {void}
  */

  socket.on('hub::getGames', function () {
    socket.emit('hub::sendGames', {
      games: games
    });
  });
  /**
   * @description Returns a user's game (for Game.tsx)
   * @return {void}
  */

  socket.on('game::getUserParty', function (payload) {
    var data = JSON.parse(payload);
    var nickname = data.nickname,
        gameType = data.gameType;
    var userGame = gamesObject[gameType].find(function (game) {
      return game.players.find(function (player) {
        return player.name === nickname;
      });
    }); // The player is found in a game

    userGame != undefined ? // send the game
    socket.emit('game::userParty', {
      party: userGame
    }) // the player was not found
    : (0, _utils.display)(_chalk["default"].cyan("Cannot find player ".concat(nickname, " in a game.")));
  });
  /**
   * @description Change a user's state (is he ready to play or not ?)
   * @return {void}
  */

  socket.on('game::playerState', function (payload) {
    var data = JSON.parse(payload);
    var roomId = data.roomId,
        nickname = data.nickname,
        state = data.state;
    var game = gamesObject['MagicNumber'][roomId]; // search player

    var _iterator = _createForOfIteratorHelper(game.players),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var player = _step.value;

        // if player found
        if (player.name === nickname) {
          // change player's state 
          player.state = state;
          (0, _utils.display)(_chalk["default"].blue("Player ".concat(player.name, " is ").concat(player.state, ".")));
        }
      } // if the game have 2 players

    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    if (game.players.length === 2) {
      // if the 2 players are ready to play
      game.players[0].state === "ready" && game.players[1].state === "ready" ? //start the game
      ee.emit('game::start', {
        roomId: roomId
      }) // else
      : (0, _utils.display)(_chalk["default"].yellowBright('Waiting for the 2nd player before starting.'));
    }
  });
  /**
   * @description Pause a game
   * @return {void}
  */

  socket.on("game::pause", function (payload) {
    var roomId = payload.roomId,
        nickname = payload.nickname;
    var game = gamesObject['MagicNumber'][roomId];

    if (game.state != "paused") {
      game.state = "paused";
      (0, _utils.display)(_chalk["default"].greenBright("".concat(game.players[0].name, "'s party has been paused by ").concat(nickname, ".")));
    } else {
      (0, _utils.display)(_chalk["default"].redBright("".concat(game.players[0].name, "'s party is already in pause.")));
    }
  });
  /**
   * @description Starts a game
   * @return {void}
  */

  socket.on("game::userMagicNumber", function (payload) {
    var roomId = payload.roomId,
        magicNumber = payload.magicNumber,
        nickname = payload.nickname;
    var game = gamesObject['MagicNumber'][roomId]; // search for the player

    var player = game.players.find(function (player) {
      return player.name === nickname;
    });
    (0, _utils.display)(_chalk["default"].redBright.underline("Received magic number ".concat(magicNumber, " from ").concat(nickname, "."))); // if the current round is less than 3

    if (game.round < 3) {
      // if the magic number is the same as the user response
      if (game.magicNumber === magicNumber) {
        if (player != undefined) {
          // increment player's points
          player.points = player.points + 1; // tell the player he founded the magic number

          socket.emit('game::isMagicNumber', {
            roomId: roomId,
            found: true,
            player: player === null || player === void 0 ? void 0 : player.name
          }); // send a new magic number

          sendNewMagicNumber(roomId, socket); // start next round

          game.round = game.round + 1;
          changeRound(roomId, socket);
        }
      } else {
        // tell the player he doesn't found the magic number
        socket.emit('game::isMagicNumber', {
          found: false
        });
      }
    } // if the current round is 3
    else {
        // magic number founded
        if (game.magicNumber === magicNumber) {
          // player founded
          if (player != undefined) {
            // increment player's points and finish the game
            player.points = player.points + 1;
            ee.emit('game::finish', {
              roomId: roomId,
              gameType: 'MagicNumber'
            });
          }
        }
      }
  });
  /* ################################# INTERNS EVENTS ################################# */

  /**
   * @description Start a game
   * @return {void}
  */

  ee.on("game::start", function (payload) {
    var roomId = payload.roomId;
    var gameType = payload.gameType;
    var game = gamesObject[gameType][roomId];
    game.round = 1;

    if (game.haveBeenStarted === false) {
      // if the game have 2 players
      if (game.players.length === 2) {
        game.state = "started";
        game.haveBeenStarted = true;
        game.beg = (0, _moment["default"])().format();
        game.players[0].state = "In game";
        game.players[1].state = "In game";
        (0, _utils.display)(_chalk["default"].greenBright("".concat(game.players[0].name, "'s party has started."))); // start the game

        startGame(roomId, socket, gameType);
      } else {
        (0, _utils.display)(_chalk["default"].redBright("Cannot start ".concat(game.players[0].name, "'s party. Error: Missing player(s)")));
      }
    }
  });
  /**
   * @description Finish a game and display ranking
   * @return {void}
  */

  ee.on("game::finish", function (payload) {
    var roomId = payload.roomId;
    var gameType = payload.gameType;
    var game = gamesObject[gameType][roomId];

    if (game.isEnded === false) {
      game.isEnded = true; // sort players by points

      var ranking = game.players.sort(function (player1, player2) {
        return player2.points - player1.points;
      });
      var winner = ranking[0];
      game.state = "finished";
      game.players.map(function (player) {
        player.state = "not ready";
      });
      game.end = (0, _moment["default"])().format(); // display game results

      (0, _utils.display)(_chalk["default"].greenBright("".concat(game.players[0].name, "'s party has finished.")));
      (0, _utils.display)(_chalk["default"].white("".concat(winner.name, " won with ").concat(winner.points, " points !")));
      endGame(roomId, socket, ranking, gameType);
    }
  });
});
/* ################################# FUNCTIONS ################################# */

var startGame = function startGame(roomId, socket, type) {
  var game = gamesObject[type][roomId];

  if (type === 'MagicNumber') {
    sendNewMagicNumber(roomId, socket);
  }

  socket.emit('game::partystart', {
    roomId: roomId,
    gameType: type
  });
};

var sendNewMagicNumber = function sendNewMagicNumber(roomId, socket) {
  var magicNumber = Math.floor(Math.random() * Math.floor(5));
  var game = gamesObject['MagicNumber'][roomId];
  game.magicNumber = magicNumber;
  (0, _utils.display)(_chalk["default"].magenta("".concat(magicNumber, " is the magic number.")));
  socket.emit('game::magicNumber', {
    roomId: roomId,
    magicNumber: magicNumber
  });
};

var changeRound = function changeRound(roomId, socket) {
  socket.emit('game::nextStep', {
    roomId: roomId
  });
};

var endGame = function endGame(roomId, socket, ranking, type) {
  socket.emit('game::gameFinish', {
    roomId: roomId,
    ranking: ranking,
    gameType: type
  });
};