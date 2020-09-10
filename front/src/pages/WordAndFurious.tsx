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

export default function WordAndFurious(): JSX.Element {
    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="absolute top-0 text-4xl font-bold">Socket Game (Word And Furious)</h1>
        </div>
    )
}
