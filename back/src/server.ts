import express from 'express'
import dotenv from 'dotenv'
import chalk from 'chalk'
import io, { Socket } from 'socket.io'

import { isNull, display } from './utils'

interface User {
  nickname?: string
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

const users: Record<string, User> = {}
const games: any = []
let room: number = 0

socketio.on('connection', (socket: Socket) => {
  // CURRENT SOCKET/PLAYER

  display(chalk.cyan(`Connection opened for ( ${socket.id} )`))

  socket.on('disconnect', () => {
    if (users[socket.id]?.nickname) {
      const { nickname } = users[socket.id]
      display(chalk.yellow(`Goodbye ${nickname}`))
    }
    display(chalk.cyan(`Connection closed for ( ${socket.id} )`))
  })

  socket.on('game::sendNickname', payload => {
    const user = JSON.parse(payload)
    const { nickname } = user
    display(chalk.yellow(`Here comes a new challenger : ${nickname} ( from ${socket.id} )`))

    users[socket.id] = { nickname }

    socket.emit('game::start', {
      points: 1337,
    })
  })

  socket.on('game::createParty', payload => {
    const user = JSON.parse(payload)
    const { nickname } = user
    display(chalk.green(`Challenger : ${nickname} ( from ${socket.id} ) created a party!`))

    games[room] = { id: room, player1: nickname }

    display(chalk.red(JSON.stringify(games)))

    socket.emit('game::create', {
      games,
    })

    room = room + 1
  })

  socket.on('game::join', payload => {
    const data = JSON.parse(payload)
    const { nickname, roomId } = data
    display(chalk.green(`Challenger : ${nickname} ( from ${socket.id} ) joined party ${roomId}!`))

    /* games[room] = { player1: nickname } */

    /* room = room + 1 */

    /* display(chalk.red(JSON.stringify(games))) */

/*     socket.emit('game::createRoom', {
      participants: 1337,
    }) */
  })
})
