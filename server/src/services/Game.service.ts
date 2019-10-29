import { Game } from "../models/Game.model";
import { GameState } from "../models/GameState.model";
import { GameManager } from "../managers/game/Game.manager";
import { PublicList } from "../managers/publicList/PublicList.manager";

let gs: GameService;

export class GameService {
    private games: Game[] = [];
    private gameManagers: GameManager[] = [];
    private pl = PublicList.getInstance();

    createGame(data: { gameType: number, username: string, isPublic: boolean }) {
        const gameId = this.generateId()

        const game: Game = {
            hostJoined: false,
            id: gameId,
            isFull: false,
            players: [
                {
                    lastReactionTime: null,
                    thisReactionTime: null,
                    name: data.username,
                    score: 0,
                    isHost: true,
                    reactionTimes: []
                }
            ],
            state: GameState.waitingForPlayers,
            bestOf: data.gameType,
            createdAt: new Date().getTime(),
            creatorName: data.username,
            failedRounds: 0,
            isPublic: data.isPublic,
            additionalMessage: null,
            hostWonLastRound: null,
            cheatingHappened: false,
            missedRound: false
        }

        const gameManager = new GameManager(gameId);

        this.gameManagers.push(gameManager);

        this.games.push(game)

        if (game.isPublic) {
            this.pl.onGameAdd(game);
        }

        return game
    }

    public updateGame(game: Partial<Game>, gameId: number) {
        this.games = this.games.map((g) => {
            if (g.id === gameId) {
                if (game.isPublic && game.isFull != null && game.isFull !== g.isFull) {
                    // meaning is Full status changed
                    this.pl.onGameUpdated(game);
                }

                g = {
                    ...g,
                    ...game
                }
            }

            return g
        })
    }

    getGameById(id: number) {
        return this.games.find(g => g.id === id);
    }

    getGameManagerById(id: number) {
        return this.gameManagers.find(g => g.gameId === id)
    }

    destroyGameById(id: number) {
        this.games = this.games.filter(g => g.id !== id);
        this.gameManagers = this.gameManagers.filter(g => g.gameId !== id);
        this.pl.onGameDestroy(id);
    }

    private generateId() {
        let gameId = Math.floor(Math.random() * 999999999);
        while (this.getGameById(gameId)) {
            gameId = Math.floor(Math.random() * 999999999);
        }

        return gameId;
    }


    static getInstance() {
        if (!gs) {
            gs = new GameService()
        }

        return gs;
    }
}
