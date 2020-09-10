import React, { useState, useEffect } from "react"
import { useUser } from '../core/contexts/userContext'
import { Link } from 'react-router-dom'

type Game = {
    id: number,
    name: string,
    description: string,
    likes: number
}

type GameType = 'MagicNumber' | 'QuickWord' | 'WordAndFurious'

export default function HUB(): JSX.Element {
    const [games, setGames] = useState<Game[]>([]);
    const [user, dispatch] = useUser()
    const { io } = user

    const chooseGameType = (gameType: string): void => {
        dispatch({ type: 'UPDATE_GAMETYPE', payload: { gameType } })
    }

    useEffect(() => {
        io.emit("hub::getGames")
    
        io.on('hub::sendGames', ({ games }: { games: Game[] }) => {
            setGames(games)
        })
    })

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-4/5">
                <h3 className="text-center text-lg leading-6 font-medium text-gray-900">
                    Choose your game type
                </h3>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    { games.map(game => {
                        return (
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-lg font-medium text-gray-500 truncate">
                                                    {game.name}
                                                </dt>
                                                <dd className="text-sm leading-5 font-medium text-gray-500 truncate">
                                                    Total Likes
                                                </dd>
                                                <dd className="flex items-baseline">
                                                    <div className="text-2xl leading-8 font-semibold text-gray-900">
                                                        {game.likes}
                                                    </div>
                                                    <div className="ml-2 flex items-baseline text-sm leading-5 font-semibold text-green-600">
                                                        <svg className="self-center flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                                        </svg>
                                                        <span className="sr-only">
                                                            Increased by
                                                        </span>
                                                        122
                                                    </div>
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                                    <div className="text-sm leading-5">
                                    <button
                                        type="button"
                                        onClick={(): void => chooseGameType(game.name)}>
                                        <Link to="/register">
                                            Play
                                        </Link>
                                    </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                    }
                </div>
            </div>
        </div>
    );
}
