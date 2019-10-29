import * as socketio from 'socket.io';
import { Game } from '../../models/Game.model';
import { GameService } from '../../services/Game.service';

export abstract class GameManagerBase {
    protected players: { socket: socketio.Socket, isHost: boolean }[] = [];
    protected game: Game;
    protected gs = GameService.getInstance()
    protected config = {
        TIME_TO_JOIN: 60000,
        TIME_BETWEEN_ROUNDS: 12000,
        MAX_REACTION_TIME: 7000,
        ALLOWED_FAILED_ROUNDS: 3,
        ROUND_RESULT_DISPLAY_TIME: 5000,
        TIME_AFTER_GAME_END: 30000,
        MIN_TIME_TILL_CLICK: 2000,
        MAX_TIME_TILL_CLICK: 10000
    }

    protected timeouts = [];
    protected intervals = []

    constructor(protected gameId: number) {}

    protected fetchGameState() {
        this.game = this.gs.getGameById(this.gameId)
    }

    protected updateStateAndSendToSockets(data: Partial<Game>) {
        this.gs.updateGame(data, this.gameId);
        this.sendToSockets('update');
    }

    protected getOtherPlayer(isHost: boolean) {
        this.fetchGameState();
        return this.game.players.find(p => p.isHost !== isHost)
    }

    protected getPlayer(isHost: boolean) {
        this.fetchGameState();
        return this.game.players.find(p => p.isHost === isHost)
    }

    protected getHost() {
        this.fetchGameState();
        return this.game.players.find(p => p.isHost === true)
    }

    protected getGuest() {
        this.fetchGameState();
        return this.game.players.find(p => p.isHost === false)
    }

    protected getPlayersWithSortedScore() {
        this.fetchGameState();
        return this.game.players.sort((a,b)=> a.score>b.score ? 1 : -1)
    }

    protected sendToSockets(type: string, data?: object) {
        console.log(type)

        this.players.forEach(p => {
            const pl = data ? data : {
                game: this.gs.getGameById(this.gameId)
            }
           
            p.socket.emit(type, pl)
        })
    }

    protected removeListeners(type: string) {
        this.players.forEach(p => {
            p.socket.removeAllListeners(type);
        })
    }

}
