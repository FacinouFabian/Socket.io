import React, { useEffect, useState } from "react";
import { useUser } from '../core/contexts/userContext'

type Player = {
  name: string,
  points: number
}

type Players = Player[]

type Game = {
  id: number | null,
  beg: string,
  end: string,
  players: Players
}

export default function Game(): JSX.Element {
  const initialGame: Game = { id: null, beg: "", end: "", players: [] }
  const [game, setGame] = useState<Game>(initialGame);
  const [user, dispatch] = useUser()
  const { io } = user

  useEffect(() => {
    io.emit("game::getUserParty", JSON.stringify({ nickname: user.nickname }))

    io.on('game::userParty', ({ party }: { party: any }) => {
      setGame(party)
    })
  })
  
  return (
    <div className="m-auto">
        <div className="w-full">
            <div>
              <ul>
                <li>{user.nickname}</li>
                {game.players.length === 2 ? <li>{game.players[1]}</li> : ''}
              </ul>
            </div>
            {game.players.length === 1 ? 'Waiting for a participant (1/2)' : 'Participants (2/2)'}
        </div>
    </div>
  );
}
