import React, { useState, useEffect } from "react";

type Props = {
  io: SocketIOClient.Socket;
  nickname: string;
};

type Room = {
    id:number;
    player1: string;
    player2?: string;
};

export default function Rooms({ io, nickname }: Props): JSX.Element {
  const [rooms, setRooms] = useState<Room[]>([{id: 1, player1: "Me"}, {id: 2, player1: "Me", player2: "You"}]);

  const handleJoin = (room: number) => {
    io.emit("game::join", JSON.stringify({roomId: room, nickname}))
  };

  useEffect(() => {
    io.on('game::create', ({ games }: { games: Room[] }) => {
        setRooms(games)
        console.log('rooms now')
        console.log(rooms)
    })
  })

  return (
    <div className="m-auto">
      <div className="w-full">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            { rooms.map((item: Room): JSX.Element | null => {
                if (Object.entries(item).length === 0 || Object.entries(item).length === 2) {
                    return null
                } else {
                    return (
                        <li className="col-span-1 bg-white rounded-lg shadow">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                                    <h1>{item.player1}'s party</h1>
                                </div>
                                <div className="px-4 py-5 sm:p-6">
                                    <span>
                                        Players: {Object.keys(item).length === 1 ? '1' : ''}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200">
                                    <button 
                                        onClick={(): void => handleJoin(2)}
                                        className="px-4 py-4 sm:px-6 w-full h-full bg-red-800 text-white">
                                        Join
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
