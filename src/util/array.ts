import { randomInt } from 'crypto'

export function shuffleInPlace<Type>(array: Array<Type>) {
    for (let index = array.length - 1; index > 0; index--) {
        const newIndex = randomInt(index + 1);
        [array[index], array[newIndex]] = [array[newIndex], array[index]];
    }
}

export function findIndexAdjacent<Type>(array: Array<Type>, predicate:(lhs: Type, rhs: Type) => boolean = (lhs, rhs) => lhs === rhs): number {
    let first = array[0]
    for (let index = 1; index < array.length; index++) {
        const second = array[index]
        if (predicate(first, second)) {
            return index - 1
        }
        first = second
    }

    return -1
}

export function nextOrWrap<Type>(array: Array<Type | null>, currentIndex): number {
    do {
        currentIndex++
        if (currentIndex === array.length) currentIndex = 0
    } while(array[currentIndex] === null)
    return currentIndex
}