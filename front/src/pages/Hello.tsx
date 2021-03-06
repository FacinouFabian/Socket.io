import React, { useState, useEffect } from "react";
import { useUser } from '../core/contexts/userContext'
import Register from './Register'

/* type Props = {
  io: SocketIOClient.Socket;
  nickname: string;
}; */

export default function Hello(): JSX.Element {
  const [{ io }, dispatch] = useUser()

  return (
    <div className="h-full flex">
      <div className="m-auto">
        <div className="flex items-center justify-center w-full">
          {!io ? (
            <button
              className="bg-blue-800 hover:bg-red-800 text-white px-8 py-8 rounded-md"
              type="button"
            >
              Join the Game
            </button>
          ) : (
            /* <Rooms io={io} nickname="Fabian" /> */
            <Register />
          )}
        </div>
      </div>
    </div>
  );
}
