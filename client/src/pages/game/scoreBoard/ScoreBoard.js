
import React from 'react'

export default function ScoreBoard(props) {
    const you = props.you;
    const other = props.other;

    return (
        <div className='scoreBoard'>

            <div className='player-box'>
                <span className='player'>
                    {you ? <React.Fragment><span className='name'>{you.name}<span className='you'>(you)</span></span>
                        <span className='score'>{you.score}</span></React.Fragment> : <span className='name'>waiting...</span>}
                </span>
                <span className='vs'>vs</span>
                <span className='player'>
                    {other ? <React.Fragment><span className='name'>{other.name}</span>
                        <span className='score'>{other.score}</span></React.Fragment> : <span className='name'>waiting...</span>}
                </span>
            </div>
        </div>
    )
}

