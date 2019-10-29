const ENV = require('dotenv');
ENV.config();

import "reflect-metadata";
import * as express from 'express';
import * as bodyParser from 'body-parser'
import * as http from 'http';
import * as socketio from 'socket.io';
import { setupSocket } from "./socket";
import { GameService } from "./services/Game.service";
const cors = require('cors')

var corsOptions = {
  origin: function (origin, callback) {
    callback(null, true)

    //   console.log(origin)
    // if (whitelist.indexOf(origin) !== -1) {
    //   callback(null, true)
    // } else {
    //     console.log('denying')
    //   callback(new Error('Not allowed by CORS'))
    // }
  },
  exposedHeaders: ['set-token', 'Authentication', 'x-xsrf-token', 'Access-Control-Allow-Headers', 'Origin', 'Accept', 'X-Requested-With', 'Content-Type', 'Access-Control-Request-Method', 'Access-Control-Expose-Headers', 'x-app-token', 'set-cookie', 'set-remember-token', 'remember-token', 'dev-request-invitation-code', 'dev-invitation-code', 'dev-request-sign-up-id', 'dev-sign-up-id'],
  allowedHeaders: ['X-Requested-With', 'Content-Type', 'Accept', 'X-Custom-header', 'set-token', 'Authentication', 'x-xsrf-token', 'Access-Control-Allow-Headers', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Expose-Headers', 'x-app-token', 'set-cookie', 'set-remember-token', 'remember-token', 'dev-request-invitation-code', 'dev-invitation-code', 'dev-request-sign-up-id', 'dev-sign-up-id']

}

const port = process.env.PORT;

const exec = require('child_process').exec;
function killPorts() {
    return new Promise((res, rej) => {
        exec(`fuser -k ${port}/tcp`, function (err, stdout, stderr) {
            res();
        });
    })
}



(async function () {
    await killPorts();

    const app = express();
    const httpServer = http.createServer(app);
    const io = socketio(httpServer);

    setupSocket(io);

    app.use(cors(corsOptions));

    app.use(bodyParser.json());

    app.post('/create-game', function (req, res) {
        const gs = GameService.getInstance()

        // TODO: validate this
        const { gameType, username, isPublic } = req.body;

        const game = gs.createGame({
            gameType,
            username,
            isPublic
        })

        res.status(201).send(game)
    });


   httpServer.listen(port, () => {
       console.log('Socket listening!')
   })
})();

