import * as socketio from 'socket.io';
import { PublicList } from '../managers/publicList/PublicList.manager';

export function publicSocket(io: socketio.Server) {

    const nsp = io.of('/games');

    console.log('Setting up games!')
    nsp.on('connection', (socket) => {
        console.log('Connected to games!')
        const ps = PublicList.getInstance()

        let id = ps.onConnect(socket)

        socket.on('disconnect', () => {
            ps.onDisconnect(id)
        })
        
    })

}
