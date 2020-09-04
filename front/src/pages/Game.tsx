import React, { useEffect, useState } from "react";
import { useUser } from '../core/contexts/userContext'
import useInput from "../hooks/useInput"

type PlayerState = "ready" | "not ready" | "In game"

type Player = {
  name: string,
  points: number
  state: PlayerState
}

interface MagicNumberResult {
  roomId: number
  found: boolean
  player: string
}

type Scores = Player[]

type GameState = "waiting" | "started" | "paused" | "finished"

type Players = Player[]

type Game = {
  id: number | null,
  beg: string,
  end: string,
  players: Players,
  state: GameState
}

export default function Game(): JSX.Element {
  const initialGame: Game = { id: null, beg: "", end: "", players: [], state: "waiting" }
  const [game, setGame] = useState<Game>(initialGame)
  const [serverMessage, setServerMessage] = useState<MagicNumberResult>()
  const [scores, setScores] = useState<Scores>()
  const [value, setValue] = useState<string>('')
  const [user, dispatch] = useUser()
  const { io } = user

  const sendMagicNumber = (): void => {
    io.emit('game::userMagicNumber', { 
      roomId: game.id, 
      magicNumber: parseInt(value), 
      nickname: user.nickname
    })

    io.on('game::isMagicNumber', (message: MagicNumberResult) => {
      setServerMessage(message)
      if (message.found === true) {
        let player = game.players.find(player => player.name === message.player)
        if (player != undefined) {
          player.points = player.points + 1
        } 
      }
    })
  }

  useEffect(() => {
    io.emit("game::getUserParty", JSON.stringify({ nickname: user.nickname }))

    io.on('game::userParty', ({ party }: { party: any }) => {
      setGame(party)
    })

    io.on('game::gameStart', ({ roomId }: { roomId: number }) => {
      if (roomId === game.id) {
        game.players.map(player => {
          player.state = "In game"
        })
      }
    })

    io.on('game::gameFinish', ({ roomId, ranking }: { roomId: number, ranking: Scores }) => {
      if (roomId === game.id) {
        game.players.map(player => {
          player.state = "not ready"
        })
        game.state = "finished"
        setScores(ranking)
      }
    })

    io.on('game::magicNumber', ({ roomId, magicNumber }: { roomId: number, magicNumber: number }) => {
      console.log(`Received magicNumber ${magicNumber} for Game ${roomId} from server.`)
    })
  })
  
  return (
    <div className="flex flex-col items-center justify-center">
        <h1 className="absolute top-0 text-4xl font-bold">Socket Game (Magic Number)</h1>
        <div className="w-full flex flex-col items-center justify-center">
            <div>
              <div>
                {(game.players[0]) ? 
                  <ul>
                    <li className="font-bold">
                      {game.players[0].name}
                    </li>
                    <li>
                      Points: <span className="font-bold">{game.players[0].points}</span>
                    </li>
                    <li className={`
                      inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium leading-5
                      ${game.players[0].state === "ready" ? 
                      'bg-green-100 text-green-800'
                      : game.players[0].state === "not ready" ? 
                      'bg-red-100 text-red-800'
                      : 'bg-purple-800 text-white'
                      }
                    `}>
                      {game.players[0].state}
                    </li>
                  </ul> 
                  : 
                  ''
                }
                {(game.players[1]) ? 
                  <ul>
                    <li className="font-bold">
                      {game.players[1].name}
                    </li>
                    <li>
                      Points: <span className="font-bold">{game.players[1].points}</span>
                    </li>
                    <li className={`
                      inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium leading-5
                      ${game.players[1].state === "ready" ? 
                      'bg-green-100 text-green-800'
                      : game.players[1].state === "not ready" ? 
                      'bg-red-100 text-red-800'
                      : 'bg-purple-800 text-white'
                      }
                    `}>
                      {game.players[0].state}
                    </li>
                  </ul> 
                  : 
                  ''
                }
              </div>
            </div>

            <div className="p-3 absolute right-0 top-0 rounded-bl-lg   bg-blue-800 text-white">
              <span className="font-semibold">
                {game.players.length === 1 ? 'Waiting for a participant (1/2)' : 'Participants (2/2)'}
              </span>
            </div>

            <div>
              <form className="bg-white shadow-md rounded-lg px-8 py-8 m-4">
                <div className="flex flex-col items-center justify-center mb-4">
                  <label className="block text-black text-md font-bold mb-2">
                    Magic Number 
                  </label>
                  <input
                    className="shadow appearance-none border rounded py-2 px-4"
                    placeholder="Magic Number..."
                    value={value}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>): void => setValue(event.target.value)}
                  />
                </div>
                <div className="flex flex-col items-center justify-between w-full">
                  <button
                    className="bg-blue-800 hover:bg-red-800 text-white px-6 py-2 rounded-md"
                    type="button"
                    onClick={() => sendMagicNumber()}
                  >
                    Send
                  </button>
                </div>
              </form>

              <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5">
                <div className="max-w-screen-xl mx-auto px-2 sm:px-6 lg:px-8">
                  <div className="p-2 rounded-lg bg-indigo-600 shadow-lg sm:p-3">
                    <div className="flex items-center justify-between flex-wrap">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="flex p-2 rounded-lg bg-indigo-800">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                          </svg>
                        </span>
                        <p className="ml-3 font-medium text-white truncate">
                          {
                            serverMessage?.found === true ? 
                              <span>
                                Congratulations!✨ player{' '}
                                <strong className="p-2 bg-indigo-800 text-white rounded-md">{serverMessage.player}</strong>
                                {' '}found the magic number. 🔥
                              </span>
                            :
                            serverMessage?.found === false ?
                              <span>Wrong answer!🙊 Try again! 😃</span>
                            : 
                            scores != undefined ?
                              <span>
                                Congratulations!✨ player{' '}
                                <strong className="p-2 bg-indigo-800 text-white rounded-md">{scores[0].name}</strong>
                                {' '}Won with {scores[0].points} 🔥
                              </span>
                            :
                              <span>Good luck ! 😃</span>
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
        </div>
    </div>
  );
}
