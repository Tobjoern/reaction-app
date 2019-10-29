
import React, { useState } from 'react'
import { Button } from 'antd'

export default function ActionBox(props) {
    const { game, timeTillNextRound, onClick, onRequestSkip, you, other } = props;

    // TODO: make reaction time switch, to prevent errors if anything updated
    const [state, setstate] = useState({
        clickedSkip: false,
        stateOverwrite: null
    })

    let renderTime;

    if (game.state === 'requestingClicks') {
        renderTime = new Date().getTime();
    }

    // waiting for players?!
    if (game.state !== 'waitingForRound' && state.clickedSkip === true) {
        setstate({
            ...state,
            clickedSkip: false
        })
    }

    const clickSkip = () => {
        setstate({
            ...state,
            clickedSkip: true
        })

        onRequestSkip()

    }

    if (state.stateOverwrite && !(game.state === 'requestingClicks' || game.state === 'roundStarted')) {
        setstate({
            ...state,
            stateOverwrite: null
        })
    }

    const clickReactionTime = () => {
        onClick(renderTime ? new Date().getTime() - renderTime : null)
        setstate({
            ...state,
            stateOverwrite: 'waitingForPlayers'
        })
    }

    let toRender;
    switch (state.stateOverwrite ? state.stateOverwrite : game.state) {
        case 'waitingForPlayers':
            toRender = <div className='action-box waiting--player'>
                <span className='heading'>Waiting for Player...</span>

            </div>
            break;
        case 'waitingForRound':
            toRender = <div className='action-box waiting--round'>
                <span className='heading'>Waiting for next round...</span>

                <Button type='dashed' size='large' onClick={clickSkip} disabled={state.clickedSkip}>Next Round! ({timeTillNextRound / 1000}s)</Button>
            </div>
            break;
        case 'roundStarted':
            toRender = <div className='action-box waiting' onClick={clickReactionTime}>
                <span className='heading'>Wait for thes green light...</span>
            </div>
            break;
        case 'requestingClicks':
            toRender = <div className='action-box press' onClick={clickReactionTime}>
                <span className='heading'>Click!</span>
            </div>
            break;
        case 'roundResult':
            toRender = <div className='action-box'>
                <span className='heading'>Round ended!</span>
                {game.additionalMessage ? <span className='sub-heading'>{game.additionalMessage}</span> : null}
                {!game.missedRound ? <span className='sub-heading'>You {game.hostWonLastRound === you.isHost ? ' won!' : ' lost!'}</span> : null}

                {!game.cheatingHappened ? <div className='result-box'>
                    <div className='result-line'>
                        <span className='result-title'>Your Time:</span>
                        <span className='result-value'>{you.lastReactionTime ? you.lastReactionTime + 'ms' : 'disqualified'}</span>
                    </div>
                    <div className='result-line'>
                        <span className='result-title'>{other.name}'s Time:</span>
                        <span className='result-value'>{other.lastReactionTime ? other.lastReactionTime + 'ms' : 'disqualified'}</span>
                    </div>
                </div> : null}

            </div>
            break;
        default:
            toRender = null;
    }


    return toRender
}

