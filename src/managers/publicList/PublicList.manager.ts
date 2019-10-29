import * as socketio from 'socket.io';
import { Game } from '../../models/Game.model';

let pl: PublicList;

export class PublicList {
    private subscribers: { socket: socketio.Socket, id: number }[] = []
    private games: Game[] = []

    constructor() {}

    public onConnect(socket: socketio.Socket): number {
        const id = this.generateId()

        this.subscribers = [
            ...this.subscribers,
            {
                socket,
                id
            }
        ]

        socket.emit('init', {
            games: this.games
        })

        return id;
    }

    public onDisconnect(id: number) {
        this.subscribers = this.subscribers.filter(s => s.id !== id)
    }

    public onGameAdd(game: Game) {
        this.sendToSockets('added', {
            game
        })
        this.games = [...this.games, game];
    }

    public onGameUpdated(game: Partial<Game>) {
        this.sendToSockets('updated', {
            game
        })
        this.games = this.games.map(g => g.id === game.id ? {...g, ...game} : g)
    }

    public onGameDestroy(gameId: number) {
        this.sendToSockets('removed', {
            gameId
        })
        this.games = this.games.filter(g => g.id !== gameId)
    }

    private sendToSockets(type, payload) {
        this.subscribers.forEach(s => {
            s.socket.emit(type, payload)
        })
    }

    private generateId() {
        let id = Math.floor(Math.random() * 999999999);
        while (this.subscribers.find(s => s.id === id)) {
            id = Math.floor(Math.random() * 999999999);
        }
        return id;
    }

    static getInstance() {
        if (!pl) {
            pl = new PublicList()
        }

        return pl;
    }
}
