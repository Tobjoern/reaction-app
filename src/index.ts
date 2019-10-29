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
const path = require('path')

var corsOptions = {
  origin: function (origin, callback) {
    callback(null, true)
  },
  exposedHeaders: ['set-token', 'Authentication', 'x-xsrf-token', 'Access-Control-Allow-Headers', 'Origin', 'Accept', 'X-Requested-With', 'Content-Type', 'Access-Control-Request-Method', 'Access-Control-Expose-Headers', 'x-app-token', 'set-cookie', 'set-remember-token', 'remember-token', 'dev-request-invitation-code', 'dev-invitation-code', 'dev-request-sign-up-id', 'dev-sign-up-id'],
  allowedHeaders: ['X-Requested-With', 'Content-Type', 'Accept', 'X-Custom-header', 'set-token', 'Authentication', 'x-xsrf-token', 'Access-Control-Allow-Headers', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Expose-Headers', 'x-app-token', 'set-cookie', 'set-remember-token', 'remember-token', 'dev-request-invitation-code', 'dev-invitation-code', 'dev-request-sign-up-id', 'dev-sign-up-id']

}

const inProd = process.env.NODE_ENV === 'production';
const port = process.env.PORT;

let killPorts;
if (!inProd) {
    const exec = require('child_process').exec;
    killPorts = function() {
        return new Promise((res, rej) => {
            exec(`fuser -k ${port}/tcp`, function (err, stdout, stderr) {
                res();
            });
        })
    }
}





(async function () {
    if (!inProd) {
        await killPorts();
    }

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

    if (inProd) {
        app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
        })
    }

   httpServer.listen(port, () => {
       console.log('Socket listening!')
   })
})();

