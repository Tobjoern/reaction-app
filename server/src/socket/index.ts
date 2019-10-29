import * as socketio from 'socket.io';
import { gameSocket } from './gameSocket';
import { publicSocket } from './publicSocket';


export function setupSocket(io: socketio.Server) {

    publicSocket(io)

    gameSocket(io);

}


