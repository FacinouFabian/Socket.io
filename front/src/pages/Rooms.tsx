import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom'
import { useUser } from '../core/contexts/userContext'

type Player = {
  name: string,
  points: number
}

type GameState = "waiting" | "started" | "paused" | "finished"

type Players = Player[]

type Game = {
  id: number,
  beg: string,
  end: string,
  players: Players,
  state: GameState,
  haveBeenStarted: boolean,
  isEnded: boolean,
  magicNumber?: number,
  round: number,
  type: string
}

export default function Rooms(): JSX.Element {
  const [rooms, setRooms] = useState<Game[]>([]);
  const [user, dispatch] = useUser()
  const { io, gameType } = user

  const handleJoin = (roomId: number) => {
    io.emit("game::joinParty", JSON.stringify({ roomId, nickname: user.nickname, gameType }))
    io.emit('game::begin', { roomId, gameType })
  };

  useEffect(() => {
    io.emit("game::getRooms")

    io.on('game::rooms', ({ partys }: { partys: Game[] }) => {
      setRooms(partys)
    })
  })

  return (
    <div className="m-auto">
      <div className="w-full">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            { rooms.map((item: Game): JSX.Element | null => {
                if (item.state != "waiting") {
                    return null
                } else {
                    return (
                        <li className="col-span-1 bg-white rounded-lg shadow">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                                  <h1>
                                    {item.players[0].name}'s party{' '}
                                    <span>({item.type})</span>
                                  </h1>
                                </div>
                                <div className="px-4 py-5 sm:p-6">
                                    <span>
                                        Players: {item.players.length === 1 ? '1' : ''}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200">
                                    <button
                                      className="w-full h-full bg-red-800 hover:bg-blue-800 text-white px-4 py-4 sm:px-6"
                                      type="button"
                                      onClick={() => handleJoin(item.id)}
                                    >
                                      <Link to={
                                        gameType === 'MagicNumber' ? "/magicnumber" 
                                        : gameType === 'QuickWord' ? "/quickword" 
                                        : "/wordandfurious"
                                      }>
                                        Join
                                      </Link>
                                    </button>
                                </div>
                            </div>
                        </li>
                    )
                }
            })}
        </ul>
      </div>
    </div>
  );
}
