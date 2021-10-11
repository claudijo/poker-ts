# Poker (TypeScript)
This is a TypeScript port of the C++ Poker library written by Janko Dedic [https://github.com/JankoDedic/poker](https://github.com/JankoDedic/poker).

Notable differences between poker-ts and the [Node.js binding](https://github.com/JankoDedic/poker.js) of the original library include:
* The table constructor takes a second optional `numSeats` argument to facilitate a table up to 23 players (defaults to `9`)
* Odd chips in a pot with several winners will be distributed to the first players, counting clockwise, after the dealer button (as opposed to handling fractions of chips)
* Added winners method (TODO: Add tests)

## License
[MIT](LICENSE)