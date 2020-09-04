import React, { useEffect, useState } from "react";
import { useUser } from '../core/contexts/userContext'
import useInput from "../hooks/useInput"

type Player = {
  name: string,
  points: number
}

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
  const [game, setGame] = useState<Game>(initialGame);
  const [value, setValue] = useState<string>('')
  const [user, dispatch] = useUser()
  const { io } = user

  const sendMagicNumber = (): void => {
    io.emit('game::userMagicNumber', { 
      roomId: game.id, 
      magicNumber: parseInt(value), 
      nickname: user.nickname
    })

    io.on('game::isMagicNumber', ({ response }: { response: string }) => {
      console.log(response)
    })
  }

  useEffect(() => {
    io.emit("game::getUserParty", JSON.stringify({ nickname: user.nickname }))

    io.on('game::userParty', ({ party }: { party: any }) => {
      setGame(party)
    })

    io.on('game::magicNumber', ({ roomId, magicNumber }: { roomId: number, magicNumber: number }) => {
      console.log(`Received magicNumber ${magicNumber} for Game ${roomId} from server.`)
    })
  })
  
  return (
    <div className="m-auto">
        <div className="w-full">
            <div>
              <ul>
                <li>{[JSON.stringify(game.players[0])]}</li>
                {game.players.length === 2 ? <li>{game.players[1]}</li> : ''}
              </ul>
            </div>

            <div>
              <span>
                {game.players.length === 1 ? 'Waiting for a participant (1/2)' : 'Participants (2/2)'}
              </span>
            </div>

            <div>
              <form className="bg-white shadow-md rounded-lg px-8 py-8 m-4">
                <div className="mb-4">
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
                    className="bg-blue-800 hover:bg-red-800 text-white px-2 py-2 rounded-md"
                    type="button"
                    onClick={() => sendMagicNumber()}
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
        </div>
    </div>
  );
}
