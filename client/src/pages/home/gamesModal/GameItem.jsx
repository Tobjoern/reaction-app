
import React from 'react'
import { Button } from 'antd'

export default function GameItem(props) {
    const game = props.game

    return (
        <div className="game-item">
            <span className="creator-name">{game.creatorName}</span>
            <span className="player-count">{game.isFull ? 2 : 1}/2</span>
            <Button size="small" onClick={() => props.onJoin(game)} disabled={game.isFull}>Join</Button>
        </div>
    )
}

