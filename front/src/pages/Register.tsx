import React, { useState, useEffect } from "react";
import useInput from "../hooks/useInput";
import { useUser } from '../core/contexts/userContext'
import { Link } from 'react-router-dom'

type Player = {
  nickname?: string;
  points?: number;
};

export default function Register(): JSX.Element {
  const [player, setPlayer] = useState<Player>();
  const { value: nickname, bind } = useInput();
  const [user, dispatch] = useUser()
  const { io } = user

  const handleJoinParty = () => {
    io.on("game::start", ({ points }: { points: number }) => {
      setPlayer({ nickname, points });
    });

    io.emit("game::sendNickname", JSON.stringify({ nickname }))
  
  };

  const handleCreateParty = () => {
    io.emit("game::sendNickname", JSON.stringify({ nickname }))
    io.emit("game::createParty", JSON.stringify({ nickname }))
  }

  return (
    <div className="m-auto">
      <div className="w-full max-w-xs">
        <form className="bg-white shadow-md rounded-lg px-8 py-8 m-4">
          <h1 className="mt-2 mb-2 font-bold text-red-800">
            Hello {player?.nickname && `${player.nickname} (${player.points})`}
          </h1>
          <div className="mb-4">
            <label className="block text-black text-md font-bold mb-2">
              Nickname
            </label>
            <input
              className="shawod appearance-none border rounded py-2 px-4"
              placeholder="Sephiroth"
              {...bind}
            />
          </div>
          <div className="flex flex-col items-center justify-between w-full">
            <button
              className="bg-blue-800 hover:bg-red-800 text-white px-2 py-2 rounded-md"
              type="button"
              onClick={() => handleJoinParty()}
            >
              <Link to="/rooms">
                Send and join a party
              </Link>
            </button>
            <button
              className="mt-2 bg-red-800 hover:bg-blue-800 text-white px-2 py-2 rounded-md"
              type="button"
              onClick={() => handleCreateParty()}
            >
              <Link to="/games">
                Send and create a party
              </Link>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
