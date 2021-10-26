import Card from './card';
export default class Deck extends Array<Card> {
    private readonly shuffle;
    private _size;
    constructor(shuffleAlgorithm?: (array: Card[]) => void);
    fillAndShuffle(): void;
    draw(): Card;
}
