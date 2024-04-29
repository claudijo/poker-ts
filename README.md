# Poker (TypeScript)
Poker-ts is a poker game engine that can be used to serve Texas hold'em games for real players.

## Acknowledgment
This library is a TypeScript port of the [C++ Poker library](https://github.com/JankoDedic/poker) written by Janko Dedic. Note that minor differences in the API might exist.

## Example Usage
Poker-ts exports a `Poker.Table` class that represents a state machine and models a real-world poker table. 

Short example below:
```js
const Poker = require('poker-ts');

table = new Poker.Table({ smallBlind: 50, bigBlind: 100 })

table.sitDown(0, 1000); // seat a player at seat 0 with 1000 chips buy-in
table.sitDown(2, 1500); // seat a player at seat 2 with 1500 chips buy-in
table.sitDown(5, 1700); // seat a player at seat 5 with 1700 chips buy-in

table.startHand();

while (table.isHandInProgress()) {
  while (table.isBettingRoundInProgress()) {
    const seatIndex = table.playerToAct();
    
    // Get `action` and possibly `betSize` in some way
    const [action, betSize] = getPlayerActionSomehow(seatIndex);
    
    table.actionTaken(action, betSize);
  }
  
  table.endBettingRound()
  
  if (table.areBettingRoundsCompleted()) {
    table.showdown()
  }
}

// 🎉 🎉 🎉 Congrats to the `table.winners()` 🎉 🎉 🎉 
```
## API
### Custom types and enums used in documentation below
```ts
type Card = {
    rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A'
    suit: 'clubs' | 'diamonds' | 'hearts' | 'spades'
}

type AutomaticAction = 'fold' | 'check/fold' | 'check' | 'call' | 'call any' | 'all-in'

type Action = 'fold' | 'check' | 'call' | 'bet' | 'raise'

type ChipRange = {
    min: number
    max: number
}

type SeatIndex = number

enum HandRanking {
    HIGH_CARD,
    PAIR,
    TWO_PAIR,
    THREE_OF_A_KIND,
    STRAIGHT,
    FLUSH,
    FULL_HOUSE,
    FOUR_OF_A_KIND,
    STRAIGHT_FLUSH,
    ROYAL_FLUSH,
}
```
### Constructor 
`Poker.Table(forcedBets: { ante?: number, bigBlind: number, smallBlind: number }, numSeats?: number)`

Creates an instance of the poker table object.

### playerToAct()
`Poker.Table.prototype.playerToAct(): number`

Returns the seat index of the player to act. (Betting round must be in progress.)

### button()
`Poker.Table.prototype.button(): number`

Returns the seat index of the button. (Hand must be in progress.)

### seats()
`Poker.Table.prototype.seats(): ({ totalChips: number, stack: number, betSize: number } | null)[]`

Returns the state of the players seated at the table.

### handPlayers()
`Poker.Table.prototype.handPlayers(): ({ totalChips: number, stack: number, betSize: number } | null)[]`

Returns the state of the players currently in the hand. (Hand must be in progress.)

### numActivePlayers()
`Poker.Table.prototype.numActivePlayers(): number`

Returns the number of active players in the active hand. (Hand must be in progress.)

### pots()
`Poker.Table.prototype.pots(): { size: number, eligiblePlayers: number[] }[]`

Returns the state of all pots in the active hand.

### forcedBets()
`Poker.Table.prototype.forcedBets(): { ante: number, bigBlind: number, smallBlind: number }`

Returns the current bet structure at the table.

### setForcedBets(forcedBets)
`Poker.Table.prototype.setForcedBets(forcedBets: { ante?: number, bigBlind: number, smallBlind: number }): void`

Modifies the bet structure of the table. (Hand must not be in progress.)

### numSeats()
`Poker.Table.prototype.numSeats(): number`

Returns the number of seats at the table.

### startHand()
`Poker.Table.prototype.startHand(): void`

Start a new hand by collecting ante, placing blinds and dealing cards. (Hand must not be in progress and there must be at least two players seated at the table.)

### isHandInProgress()
`Poker.Table.prototype.isHandInProgress(): boolean`

Returns `true` if hand is in progress.

### isBettingRoundInProgress()
`Poker.Table.prototype.isBettingRoundInProgress(): boolean`

Returns `true` if betting round is in progress. (Hand must be in progress.)

### areBettingRoundsCompleted()
`Poker.Table.prototype.areBettingRoundsCompleted(): boolean`

Returns `true` if all betting rounds are completed. (Hand must be in progress.)

### roundOfBetting()
`Poker.Table.prototype.roundOfBetting(): 'preflop' | 'flop' | 'turn' | 'river'`

Returns the current round of betting. (Hand must be in progress)

### communityCards()
`Poker.Table.prototype.communityCards(): : Card[]`

Returns the community cards for the active hand. (Hand must be in progress.)

### legalActions()
`Poker.Table.prototype.legalActions(): { actions: Action[], chipRange?: ChipRange }`

Returns legal actions for the player to act. (Betting round must be in progress.)

### holeCards()
`Poker.Table.prototype.holeCards(): (Card[] | null)[]`

Returns the hole cards for the active hand. (Hand must be in progress or showdown must have ended.)

### actionTaken(action, betSize)
`Poker.Table.prototype.actionTaken(action: Action, betSize?: number)`

Indicate that the player to act has taken an action. (Betting round must be in progress)

### endBettingRound()
`Poker.Table.prototype.endBettingRound(): void`

End the current betting round which is no longer in progress. Collect the bets and form the pots. (Betting round must not be in progress and betting rounds must not be completed.)

### showdown()
`Poker.Table.prototype.showdown(): void`

Perform a showdown. Evaluate the players' hands and pay the winners. (Betting round must not be in progress and betting rounds must be completed.)

### winners()
`Poker.Table.prototype.winners(): [SeatIndex, { cards: Card[], ranking: HandRanking, strength: number }, Card[]][][]`

Returns the winning hands for each pot after showdown. (Hand must not be in progress.)

### automaticActions()
`Poker.Table.prototype.automaticActions(): (AutomaticAction | null)[]`

Returns the toggled automatic actions at the table. (Hand must be in progress)

### canSetAutomaticActions(seatIndex)
`Poker.Table.prototype.canSetAutomaticActions(seatIndex: number): boolean`

Returns `true` if the player with a given `seatIndex` can set an automatic action. (Betting round must be in progress.)

### legalAutomaticActions(seatIndex)
`Poker.Table.prototype.legalAutomaticActions(seatIndex: number): AutomaticAction[]`

Returns an array of legal automatic actions for a player with a given `seatIndex`. (Player must be allowed to set automatic actions.)

### setAutomaticAction(seatIndex, action)
`Poker.Table.prototype.setAutomaticAction(seatIndex: number, action: AutomaticAction | null): void`

Set the automatic action for a given player. (Player must be allowed to set automatic actions and player must not be the player to act.)

### sitDown(seatIndex, buyIn)
`Poker.Table.prototype.sitDown(seatIndex: number, buyIn: number): void`

Indicate that a player took a given seat with a given buy-in. (Given seat must not be occupied.)

### standUp(seatIndex)
`Poker.Table.prototype.standUp(seatIndex: number): void`

Indicate that a player has left the table. (Given seat must be occupied.)

## License
[MIT](LICENSE)