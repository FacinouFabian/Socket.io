import express from 'express'
import dotenv from 'dotenv'
import chalk from 'chalk'
import io, { Socket } from 'socket.io'
import {EventEmitter} from "events"
import moment from 'moment'

import { isNull, display } from './utils'

interface User {
  nickname?: string
}

interface Room { 
  roomId: number 
}

interface UserAnswer {
  magicNumber: number
  roomId: number,
  nickname: string
}

type GameState = "waiting" | "started" | "paused" | "finished"

type PlayerState = "ready" | "not ready"

type Player = {
  name: string,
  state: PlayerState;
  points: number
}

type Players = Player[]

type Game = {
  id: number | null,
  beg: string,
  end: string,
  players: Players,
  state: GameState,
  magicNumber: number | null
}

// prelude -- loading environment variable
dotenv.config()
if (isNull(process.env.PORT)) {
  throw 'Sorry missing PORT env'
}

const port = parseInt(process.env.PORT)
const app = express()

const server = app.listen(port, () => {
  display(chalk.magenta(`crossPWAGame server is running on 0.0.0.0:${port}`))
})

const socketio = io(server)
const ee = new EventEmitter()

const users: Record<string, User> = {}
const games: Game[] = [
  { id: 0, beg: "Test1", end: "Test1", players: [{name: "Goldenee", points: 0, state: "not ready"}], state: "waiting", magicNumber: null },
  { id: 1, beg: "Test2", end: "Test2", players: [{name: "Majdi", points: 0, state: "not ready"}, {name: "Dylan", points: 0, state: "not ready"}], state: "waiting", magicNumber: null }
]
let room: number = 0

/**
 * @description Display a message when a connection has been initialised
 * @return {void}
*/
socketio.on('connection', (socket: Socket) => {
  // CURRENT SOCKET/PLAYER

  display(chalk.cyan(`Connection opened for ( ${socket.id} )`))

  /* ################################# EXTERNAL EVENTS ################################# */

  /**
   * @description Display a goodbye message when connection closes
   * @return {void}
  */
  socket.on('disconnect', () => {
    if (users[socket.id]?.nickname) {
      const { nickname }: User = users[socket.id]
      display(chalk.yellow(`Goodbye ${nickname}`))
    }
    display(chalk.cyan(`Connection closed for ( ${socket.id} )`))
  })

  /**
   * @description Set a new user to the Users Array
   * @return {void}
  */
  socket.on('game::sendNickname', payload => {
    const user = JSON.parse(payload)
    const { nickname }: User = user
    display(chalk.yellow(`Here comes a new challenger : ${nickname} ( from ${socket.id} )`))

    users[socket.id] = { nickname }
  })

  /**
   * @description Create a new game for a user (the user will be the owner of the game) (in Register.tsx handleCreateParty)
   * @return {void}
  */
  socket.on('game::createParty', payload => {
    const user = JSON.parse(payload)
    const { nickname }: User = user

    display(chalk.green(`Challenger : ${nickname} ( from ${socket.id} ) created a party!`))

    // create a new game with the user
    games[room] = { 
      id: room, 
      beg: "", 
      end: "", 
      players: [
        {
          name: nickname, 
          points: 0, 
          state: "not ready"
        }
      ], 
      state: "waiting", magicNumber: null 
    }

    display(chalk.red(JSON.stringify(games)))

    // increment the index for the next created game
    room = room + 1
  })

  /**
   * @description Make a user join a game (in Register.tsx handleJoinParty)
   * @return {void}
  */
  socket.on('game::joinParty', payload => {
    const data = JSON.parse(payload)
    const { nickname, roomId }: { nickname: string, roomId: number } = data

    display(chalk.green(`Challenger : ${nickname} ( from ${socket.id} ) joined ${games[roomId].players[0].name}'s party!`))
    display(chalk.red(`${games[roomId].players[0].name}'s party will start!`))

    // add the second user to the game
    games[roomId].players.push(
      {
        name: nickname, 
        points: 0, 
        state: "not ready"
      }
    )
  })

  /**
   * @description Send all games (for Rooms.tsx)
   * @return {void}
  */
  socket.on('game::getRooms', () => {
    socket.emit('game::rooms', {
      games,
    })
  })

  /**
   * @description Returns a user's game (for Game.tsx)
   * @return {void}
  */
  socket.on('game::getUserParty', payload => {
    const data = JSON.parse(payload)
    const { nickname }: User = data

    // search game
    for (const party of games) {
      // search player
      for (const player of party.players) {
        // if the player is found in a game
        if (player.name === nickname) {
          // send the game
          socket.emit('game::userParty', { party })
        } 
        else {
          // the player was not found
          display(chalk.cyan(`Cannot find player ${nickname} in a game.`))
        }
      }
    }
  })

  /**
   * @description Change a user's state (is he ready to play or not ?)
   * @return {void}
  */
  socket.on('game::playerState', payload => {
    const data = JSON.parse(payload)
    const { roomId, nickname, state }: { roomId: number, nickname: string, state: PlayerState } = data
    const game: Game = games[roomId]

    // search player
    for (const player of game.players) {
      // if player found
      if (player.name === nickname) {
        // change player's state 
        player.state = state
        display(chalk.blue(`Player ${player.name} is ${player.state}.`))
      }
    }

    // if the game have 2 players
    if (game.players.length === 2) {
      // if the 2 players are ready to play
      game.players[0].state === "ready" && game.players[1].state === "ready" ? 
      //start the game
      ee.emit('game::start', { roomId }) 
      // else
      : display(chalk.yellowBright('Waiting for the 2nd player before starting.'))
    }
  })

  /**
   * @description Pause a game
   * @return {void}
  */
  socket.on("game::pause", payload => {
    const { roomId, nickname }: { roomId: number, nickname: string } = payload
    const game: Game = games[roomId]

    if (game.state != "paused") {
      game.state = "paused"
      display(chalk.greenBright(`${game.players[0].name}'s party has been paused by ${nickname}.`))
      display(chalk.green(`${JSON.stringify(game)}`))
    }
    else {
      display(chalk.redBright(`${game.players[0].name}'s party is already in pause.`))
    }
  })

  /**
   * @description Starts a game
   * @return {void}
  */
  socket.on("game::userMagicNumber", payload => {
    const { roomId, magicNumber, nickname }: UserAnswer = payload
    const game: Game = games[roomId]

    display(chalk.redBright.underline(`Received magic number ${magicNumber} from ${nickname}.`))

    // if the magic number is the same as the user response
    if (game.magicNumber === magicNumber) {
      // search for the player
      for (const player of game.players) {
        // if player found
        if (player.name === nickname) {
          // add +1 to the player's points
          player.points = player.points + 1
        }
      }

      // tell the player he founded the magic number
      socket.emit('game::isMagicNumber', { 
        response: 'Congratulations!✨ you found the magic number. 🔥' 
      })
      
      /* ee.emit('game::finish', { roomId })  */
    }
    else {
      // tell the player he doesn't found the magic number
      socket.emit('game::isMagicNumber', { 
        response: 'Wrong answer!🙊 Try again! 😃' 
      }) 
    }
  })

  /* ################################# INTERNS EVENTS ################################# */

  /**
   * @description Start a game
   * @return {void}
  */
  ee.on("game::start", payload => {
    const { roomId }: Room = payload
    const game: Game = games[roomId]

    // if the game have 2 players
    if (game.players.length === 2) {
      game.state = "started"
      game.beg = moment().format() 

      display(chalk.greenBright(`${game.players[0].name}'s party has started.`))
      display(chalk.green(`${JSON.stringify(game)}`))

      // start the game
      startGame(roomId, socket)
    }
    else {
      display(chalk.redBright(`Cannot start ${game.players[0].name}'s party. Error: Missing player(s)`))
    }
  })

  /**
   * @description Finish a game and display ranking
   * @return {void}
  */
  ee.on("game::finish", payload => {
    const { roomId }: Room = payload
    const game: Game = games[roomId]
    // sort players by points
    const ranking = game.players.sort((player1: Player, player2: Player) => (player1.points > player2.points) ? 1 : -1)
    const winner: Player = ranking[0]

    game.state = "finished"
    game.end = moment().format()
    
    // display game results
    display(chalk.greenBright(`${game.players[0].name}'s party has finished.`))
    display(chalk.white(`${winner.name} won with ${winner.points} points !`))
    display(chalk.magenta(`Ranking : ${JSON.stringify(ranking)}`))
  })

})

/* ################################# FUNCTIONS ################################# */

const startGame = (roomId: number, socket: Socket): void => {
  const magicNumber: number =  Math.floor(Math.random() * Math.floor(1337))
  socket.emit('game::magicNumber', { roomId, magicNumber }) 
}
