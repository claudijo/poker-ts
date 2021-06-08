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