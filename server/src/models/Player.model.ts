
export interface Player {
    name: string;
    score: number;
    lastReactionTime: number;
    thisReactionTime: number;
    reactionTimes: number[];
    isHost: boolean;
}
