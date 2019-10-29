import * as socketio from 'socket.io';
import { GameService } from '../services/Game.service';


export function gameSocket(io: socketio.Server) {
    io.of('/game').use(((socket, next) => {
        const gameId = socket.handshake.query ? parseInt(socket.handshake.query.gameId, 0) : null;
        console.log(`Gamed Id ${gameId}`)

        const gs = GameService.getInstance()

        let game = gs.getGameById(gameId);

        let gm = gs.getGameManagerById(gameId)

        if (!game || !gm) {
            next(new Error('Game not found!'))
        } else if (game.isFull) {
            next(new Error('Game is full!'))
        } else {
            (socket as any).gameId = gameId
            next()
        }

    })).on('connect', (socket) => {
        const gs = GameService.getInstance();
        const gameId = (socket as any).gameId;

        let gm = gs.getGameManagerById(gameId)

        gm.onConnect(socket);

    });
}
