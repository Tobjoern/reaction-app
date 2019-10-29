import { Player } from "./Player.model";
import { GameState } from "./GameState.model";

export interface Game {
    id: number;
    isFull: boolean;
    hostJoined: boolean;
    players: Player[];
    state: GameState;
    bestOf: number;
    createdAt: number;
    isPublic: boolean;
    creatorName: string;
    failedRounds: number;
    additionalMessage: string;
    hostWonLastRound: boolean;
    cheatingHappened: boolean;
    missedRound: boolean;
}
