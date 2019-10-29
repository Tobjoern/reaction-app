import * as socketio from 'socket.io';
import { GameState } from '../../models/GameState.model';
import { GameManagerBase } from './GameManager.base';

export class GameManager extends GameManagerBase {

    constructor(public gameId: number) {
        super(gameId);
        this.waitForConnection();
    }

    private waitForConnection() {
        const tm = setTimeout(() => {
            if (this.players.length < 2) {
                this.destroyGame('Game was destroyed, as a guest failed to join!')
            }
        }, this.config.TIME_TO_JOIN)

        this.timeouts.push(tm)
    }

    public onConnect(socket: socketio.Socket) {
        socket.emit('canYouHearMe', {})

        if (this.players.length === 0) {
            this.players.push({
                isHost: true,
                socket
            });

            // is host
            this.updateStateAndSendToSockets({
                hostJoined: true,
                state: GameState.waitingForPlayers
            });
            socket.emit('areHost', {})

            this.subToDisconnect(socket, true)
            // TODO: add to game board
        } else {
            // is not host
            this.players.push({
                isHost: false,
                socket
            })

            this.updateStateAndSendToSockets({
                isFull: true
            });

            this.waitForUpdateName(socket);
            this.subToDisconnect(socket, false)
        }
    }

    private subToDisconnect(socket: socketio.Socket, isHost: boolean) {
        socket.on('disconnect', () => {
            this.destroyGame(`Game was destroyed, as ${isHost ? 'the host' : 'the guest'} disconnected!`)
        })
    }

    private unsubFromDisconnect() {
        this.removeListeners('disconnect')
    }

    // guest connected, but was not yet added to state, due to missing name
    private waitForUpdateName(socket: socketio.Socket) {
        socket.emit('askForName', {  })

        socket.on('updateName', data => {
            const username = data.username

            // TODO: validate name!

            if (!username) {
                socket.emit('askForName', { reason: 'Invalid user name.' })
            } else {
                this.fetchGameState();
                this.updateStateAndSendToSockets({
                    players: [
                        ...this.game.players,
                        {
                            isHost: false,
                            lastReactionTime: null,
                            thisReactionTime: null,
                            name: username,
                            reactionTimes: [],
                            score: 0
                        }
                    ]
                });

                socket.removeAllListeners('updateName')
                this.waitForNextRound();
            }
        })
    }

    private startRound() {
        this.updateStateAndSendToSockets({
            state: GameState.roundStarted
        })

        const waitingForClickTime = this.config.MIN_TIME_TILL_CLICK + Math.floor(Math.random() * (this.config.MAX_TIME_TILL_CLICK - this.config.MIN_TIME_TILL_CLICK));

        let requestingClicksTimeout = setTimeout(() => {
            this.updateStateAndSendToSockets({
                state: GameState.requestingClicks
            })
        }, waitingForClickTime)

        let roundTooLongTimeout = setTimeout(() => {
            this.endRound();
        }, this.config.MAX_REACTION_TIME + waitingForClickTime)

        this.timeouts.push(requestingClicksTimeout, roundTooLongTimeout)

        this.players.forEach(p => {
            p.socket.on('click', (payload) => {
                this.fetchGameState();

                p.socket.removeAllListeners('click');

                // clicket to early!
                if (this.game.state !== GameState.requestingClicks) {
                    this.fetchGameState();
                    // this.updateStateAndSendToSockets({
                    //     players: this.game.players.map(pl => {
                    //         // is the other player
                    //         if (pl.isHost !== p.isHost) {
                    //             pl.score++;
                    //         }

                    //         return pl
                    //     }) 
                    // });

                    clearTimeout(requestingClicksTimeout);
                    clearTimeout(roundTooLongTimeout);
                    this.endRound(p.isHost);
                } else {
                    const reactionTime = payload.reactionTime;
                    console.log('Reaction Time is ' + reactionTime)

                    const player = this.getPlayer(p.isHost);
                    const otherPlayer = this.getOtherPlayer(p.isHost);

                    // update reaction time
                    this.fetchGameState();
                    this.updateStateAndSendToSockets({
                        players: [
                            otherPlayer,
                            {
                                ...player,
                                thisReactionTime: reactionTime,
                                reactionTimes: [
                                    ...player.reactionTimes,
                                    reactionTime
                                ]
                            }
                        ]
                    })

                    if (otherPlayer.thisReactionTime) {
                        // finish round
                        clearTimeout(roundTooLongTimeout);
                        this.endRound();
                    } else {
                        // wait for other player
                    }
                }
            });
        })
    }

    private endRound(hostCheated?: boolean) {
        console.log('End Round')
        this.removeListeners('click');

        const guest = this.getGuest();
        const host = this.getHost();

        // if winnerWasHost, then cheating happened!
        if (hostCheated === true || hostCheated === false) {
            console.log('CHeating happened!')
            if (hostCheated) {
                guest.score++;
            } else {
                host.score++
            }

            guest.lastReactionTime = null;
            host.lastReactionTime = null;

            this.updateStateAndSendToSockets({
                players: [
                    guest,
                    host
                ],
                additionalMessage: !hostCheated ? `${guest.name} clicked too early!` : `${host.name} clicked too early!`,
                state: GameState.roundResult,
                hostWonLastRound: !hostCheated,
                cheatingHappened: true
            })
        } else {
            if (!guest.thisReactionTime && !host.thisReactionTime) {
                // round missed!
                // ALLOWED_FAILED_ROUNDS
                const failedRounds = this.game.failedRounds+1;
                this.updateStateAndSendToSockets({
                    players: [
                        {
                            ...guest,
                            lastReactionTime: null
                        },
                        {
                            ...host,
                            lastReactionTime: null
                        }
                    ],
                    failedRounds,
                    additionalMessage: `You missed to click! If you miss ${this.config.ALLOWED_FAILED_ROUNDS - failedRounds} more times, the game will be closed.`,
                    state: GameState.roundResult,
                    hostWonLastRound: null,
                    missedRound: true
                })
            } else if (!guest.thisReactionTime || !host.thisReactionTime) {
                // host won
                let winner = !guest.thisReactionTime ? host : guest;
                let looser = guest.thisReactionTime ? host : guest;

                this.updateStateAndSendToSockets({
                    players: [
                        {
                            ...guest,
                            lastReactionTime: null
                        },
                        {
                            ...winner,
                            reactionTimes: [
                                ...winner.reactionTimes,
                                winner.thisReactionTime
                            ],
                            lastReactionTime: winner.thisReactionTime,
                            thisReactionTime: null,
                            score: winner.score+1
                        }
                    ],
                    additionalMessage: `${looser.name} missed to click!`, // TODO: additional message only displayer in round result
                    state: GameState.roundResult,
                    hostWonLastRound: winner.isHost
                })
            } else {
                let winner = guest.thisReactionTime > host.thisReactionTime ? host : guest;
                let looser = guest.thisReactionTime < host.thisReactionTime ? host : guest;

                this.updateStateAndSendToSockets({
                    players: [
                        {
                            ...looser,
                            reactionTimes: [
                                ...looser.reactionTimes,
                                looser.thisReactionTime
                            ],
                            lastReactionTime: looser.thisReactionTime,
                            thisReactionTime: null
                        },
                        {
                            ...winner,
                            reactionTimes: [
                                ...winner.reactionTimes,
                                winner.thisReactionTime
                            ],
                            lastReactionTime: winner.thisReactionTime,
                            thisReactionTime: null,
                            score: winner.score+1
                        }
                    ],
                    additionalMessage: null,
                    state: GameState.roundResult,
                    hostWonLastRound: winner.isHost
                })
            }
        }

        this.checkEndOrDestroyOrStartRound();
    }

    private checkEndOrDestroyOrStartRound() {
        this.fetchGameState();

        const maxScore = Math.max(...this.game.players.map(p => p.score))
        const scoreNeededToWin = Math.ceil(this.game.bestOf / 2);

        if (this.game.failedRounds >= this.config.ALLOWED_FAILED_ROUNDS) {
            this.destroyGame('You missed too many rounds! The game will be destroyed!')
        } else if (maxScore >= scoreNeededToWin) {
            this.endGame();
        } else {
            const tm = setTimeout(() => {
                this.waitForNextRound()
            }, this.config.ROUND_RESULT_DISPLAY_TIME)

            this.timeouts.push(tm)
        }
    }

    private endGame() {
      //  const sortedPlayers = this.getPlayerWithSortedScore();

        this.updateStateAndSendToSockets({
            state: GameState.gameResult
        })

        // wait for re-match
        // on disconnect, send to other party?
        this.unsubFromDisconnect();

        const etm = setTimeout(() => {
            this.destroyGame('Server shut down');
        }, this.config.TIME_AFTER_GAME_END)

        this.timeouts.push(etm)
    }

    private waitForNextRound() {
        this.updateStateAndSendToSockets({
            state: GameState.waitingForRound,
            additionalMessage: null,
            cheatingHappened: false,
            missedRound: false
        })

        const skipWaitByType = []

        let timeLeft = this.config.TIME_BETWEEN_ROUNDS;

        let waitInteval = setInterval(() => {
            timeLeft -= 1000;

            if (timeLeft <= 0) {
                this.removeListeners('skipWait')
                clearInterval(waitInteval);
                this.startRound();
            }

            this.sendToSockets('timeTillNextRound', {
                time: timeLeft
            })
        }, 1000)

        this.intervals.push(waitInteval)

        this.players.forEach(p => {
            p.socket.on('skipWait', () => {
                if (!skipWaitByType.includes(p.isHost)) {
                    skipWaitByType.push(p.isHost);

                    if (skipWaitByType.length > 1) {
                        this.removeListeners('skipWait')
                        clearInterval(waitInteval);
                        this.startRound();
                    }
                }
            })
        })
    }

    private destroyGame(reason: string) {
        console.warn('Destroying Game!')
        this.timeouts.forEach(clearTimeout)
        this.intervals.forEach(clearInterval)

        this.players.forEach(p => {
            p.socket.emit('gameDestroyed', {
                reason
            })
            p.socket.disconnect();
        })

        this.gs.destroyGameById(this.gameId)
    }

}
