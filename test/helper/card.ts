import Card, { CardRank, CardSuit } from '../../src/lib/card'

export function makeCards(description: string): Array<Card> {
    const parts = description.split(/\s+/)
    return parts.map(part => {
        const rank = part[0]
        const suite = part[1]

        const cardRank = CardRank[rank.replace(/(\d)/, '_$1').toUpperCase()]
        const cardSuite: CardSuit = (() => {
            switch (suite.toUpperCase()) {
                case 'S':
                    return CardSuit.SPADES
                case 'H':
                    return CardSuit.HEARTS
                case 'C':
                    return CardSuit.CLUBS
                case 'D':
                    return CardSuit.DIAMONDS
                default:
                    throw new Error('Invalid suite')
            }
        })()

        return new Card(cardRank, cardSuite)
    })
}

export function shuffleForThreePlayersWithTwoWinners(array: Card[]) {
    const cards = makeCards(
        '2c 2c' + // First player
        ' Kc 2c' + // Second player
        ' Kc 2c' + // Third player
        ' Ac Ac Ac Ac As' // Community cards
    )
    cards.forEach((card, index) => array[51 - index] = card)
}

export function shuffleForTwoPlayersWithFullHouseWinner(array: Card[]) {
    const cards = makeCards(
        '4s 4c' + // First player
        ' Kc 5h' + // Second player
        ' Ac Ks 4d 2c 2s' // Community cards
    )
    cards.forEach((card, index) => array[51 - index] = card)
}
