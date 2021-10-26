import Card from "./card";
export declare enum RoundOfBetting {
    PREFLOP = 0,
    FLOP = 3,
    TURN = 4,
    RIVER = 5
}
export declare const next: (roundOfBetting: RoundOfBetting) => RoundOfBetting;
export default class CommunityCards {
    private _cards;
    cards(): Card[];
    deal(cards: Card[]): void;
}
