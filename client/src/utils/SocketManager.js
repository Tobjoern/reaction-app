import * as io from 'socket.io-client';
import { EndpointManager } from './EndpointManager';

export class SocketManager {

    gameSocket;
    listSocket;

    disconnectList() {
        this.listSocket.disconnect();
    }

    connectList(connected) {
        this.listSocket = io.connect(EndpointManager.LIST_SOCKET)

        this.listSocket.on('connect', connected);
    }

    onList(type, cb) {
        if (!this.listSocket) {
            throw new Error('List socket not defined!')
        }

        this.listSocket.on(type, cb)
    }

    disconnectGame() {
        this.gameSocket.disconnect();
    }

    emitToGame(type, payload) {
        if (!this.gameSocket) {
            throw new Error('Game socket not defined!')
        }

        this.gameSocket.emit(type, payload)
    }

    onGame(type, cb) {
        if (!this.gameSocket) {
            throw new Error('Game socket not defined!')
        }

        this.gameSocket.on(type, cb)
    }

    connectGame(gameId, connected) {
        this.gameSocket = io.connect(EndpointManager.SOCKET, {
            query: { gameId }
        });

        this.gameSocket.on('connect', connected);
    }

}
