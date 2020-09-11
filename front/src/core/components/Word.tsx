import React, { useState, useEffect } from "react";
import { useUser } from '../contexts/userContext'

export default function Word(): JSX.Element {
    const [word, setWord] = useState<string>('')
    const [{ io }, dispatch] = useUser()

    useEffect(() => {
        io.on('game::quickWord', ({ word }: { word: string }) => {
            console.log(`Received word ${word} from server.`)
            setWord(word)
        })
    })

    return (
        <div>
            <span className="font-bold text-purple-600">{word}</span>
        </div>
    )
}
