import React, { useEffect, useState } from "react";
import { useUser } from '../core/contexts/userContext'
import useInput from "../hooks/useInput"

export default function QuickWord(): JSX.Element {
    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="absolute top-0 text-4xl font-bold">Socket Game (Quick Word)</h1>
        </div>
    );
}
