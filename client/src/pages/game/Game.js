
import React, { Component } from 'react'
import { message } from 'antd';
import { SocketManager } from '../../utils/SocketManager';
import './Game.scss';
import ActionBox from './actionBox/ActionBox';
import ScoreBoard from './scoreBoard/ScoreBoard'
import { withRouter } from "react-router-dom";
import EndModal from './endModal/EndModal';

class Game extends Component {

    state = {
        isConnected: false,
        isConnecting: true,
        isHost: false,
        game: {
            state: 'waitingForPlayers',
            players: []
        },
        timeTillNextRound: 0
    }

    history;
    gameId;
    socket;

    constructor(props) {
        super(props);

        this.socket = new SocketManager();

        this.history = props.history;
        this.gameId = parseInt(props.location.search.substr(4), 0);

        if (Number.isNaN(this.gameId)) {
            message.error('Invalid Game id!')
            this.history.push('/')
        }
    }

    getOwnPlayer = (game) => {
        return game.players.find(p => p.isHost === this.state.isHost)
    }

    getOtherPlayer = (game) => {
        return game.players.find(p => p.isHost !== this.state.isHost)
    }

    componentWillUnmount() {
        this.socket.disconnectGame()
    }

    componentDidMount() {
        this.socket.connectGame(this.gameId, () => {
            this.setState({
                ...this.state,
                isConnecting: false,
                isConnected: true
            })
        })

        this.socket.onGame('error', (payload) => {
            if (payload) {
                message.error(payload)
                this.history.push('/')
            }
        })

        this.socket.onGame('update', (payload) => {
            this.setState({
                ...this.state,
                game: payload.game
            })
        })

        this.socket.onGame('askForName', (payload) => {
            const error = payload.reason;

            // bad practice prompt, to save time, but it will block execution context, so setTimeout, so it can render once
            // TODO: It would be better to make a modal.
            setTimeout(() => {
                const username = prompt('Please enter you user Name.' + (error ? ' ' + error : ''));
                this.socket.emitToGame('updateName', {
                    username
                })
            }, 50)
        })

        this.socket.onGame('gameDestroyed', (payload) => {
            message.error(payload.reason);
            this.history.push('/')
        })

        this.socket.onGame('areHost', (payload) => {
            this.setState({
                ...this.state,
                isHost: true
            })
        })

        this.socket.onGame('timeTillNextRound', (payload) => {
            this.setState({
                ...this.state,
                timeTillNextRound: payload.time
            })
        })
    }

    onClick = (reactionTime) => {
        this.socket.emitToGame('click', {
            reactionTime
        })
    }

    onRequestSkip = () => {
        this.socket.emitToGame('skipWait', {})
    }

    // <EndModal></EndModal>
    render(props) {
        const { game, timeTillNextRound, isHost } = this.state;

        let you;
        let otherPlayer;
        if (game.players[0]) {
            if (game.players[0].isHost === isHost) {
                you = game.players[0]
                otherPlayer = game.players[1]
            } else {
                otherPlayer = game.players[0]
                you = game.players[1]
            }
        }

        return (
            <div className='game'>
                <ScoreBoard you={you} other={otherPlayer}></ScoreBoard>
                {game.state !== 'gameResult' ? <ActionBox you={you}
                    other={otherPlayer}
                    game={game}
                    timeTillNextRound={timeTillNextRound}
                    onClick={this.onClick}
                    onRequestSkip={this.onRequestSkip}></ActionBox> : <EndModal you={you}
                    other={otherPlayer}></EndModal>}

            </div>
        )
    }
}

export default withRouter(Game)
