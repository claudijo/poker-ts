# Poker (TypeScript)
This is a TypeScript port of the C++ Poker library written by Janko Dedic [https://github.com/JankoDedic/poker](https://github.com/JankoDedic/poker).

Notable differences between poker-ts and the [Node.js binding](https://github.com/JankoDedic/poker.js) of the original library include:
* The structure of the `forcedBets` argument passed to the constructor and to the `setForcedBets` method
* The table constructor takes a second optional `numSeats` argument to facilitate a table up to 23 players (defaults to `9`)
* *TODO:* Automatic action `CALL` will be invalidated if player is contested before his/her turn

## License
[MIT](LICENSE)