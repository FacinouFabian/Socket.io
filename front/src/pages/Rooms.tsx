import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom'
import { useUser } from '../core/contexts/userContext'

type Player = {
  name: string,
  points: number
}

type Players = Player[]

type Game = {
  id: number,
  beg: string,
  end: string,
  players: Players
}

export default function Rooms(): JSX.Element {
  const [rooms, setRooms] = useState<Game[]>([]);
  const [user, dispatch] = useUser()
  const { io } = user

  const handleJoin = (roomId: number) => {
    io.emit("game::joinParty", JSON.stringify({ roomId, nickname: user.nickname }))
  };

  useEffect(() => {
    io.emit("game::getRooms")

    io.on('game::rooms', ({ games }: { games: Game[] }) => {
      setRooms(games)
    })

    io.on('game::create', ({ games }: { games: Game[] }) => {
      setRooms(games)
      console.log('rooms now')
      console.log(rooms)
    })

    io.on('game::join', ({ game }: { game: Game }) => {
      console.log('Request for')
      console.log(game)
    })
  })

  return (
    <div className="m-auto">
      <div className="w-full">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            { rooms.map((item: Game): JSX.Element | null => {
                if (item.players.length === 2) {
                    return null
                } else {
                    return (
                        <li className="col-span-1 bg-white rounded-lg shadow">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                                    <h1>{item.players[0].name}'s party</h1>
                                </div>
                                <div className="px-4 py-5 sm:p-6">
                                    <span>
                                        Players: {item.players.length === 1 ? '1' : ''}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200">
                                    <button 
                                        onClick={(): void => handleJoin(item.id)}
                                        className="px-4 py-4 sm:px-6 w-full h-full bg-red-800 text-white">
                                        <Link to="/games">
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
