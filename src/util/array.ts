import { randomInt } from 'crypto'
import assert from 'assert'

export function shuffle<Type>(array: Array<Type>) {
    for (let index = array.length - 1; index > 0; index--) {
        const newIndex = randomInt(index + 1);
        [array[index], array[newIndex]] = [array[newIndex], array[index]];
    }
}

export function findIndexAdjacent<Type>(array: Array<Type>, predicate:(first: Type, second: Type) => boolean = (first, second) => first === second): number {
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

export function rotate(array: Array<any>, count: number) {
    count -= array.length * Math.floor(count / array.length);
    array.push.apply(array, array.splice(0, count));
}

// Remove consecutive (adjacent) duplicates
export function unique<Type>(array:Array<Type>,  predicate:(first: Type, second: Type) => boolean = (first, second) => first !== second) : Array<Type> {
    if (array.length === 0) {
        return array
    }
    return array.slice(1).reduce((acc, item) => {
        if (predicate(acc[acc.length - 1], item)) {
            acc.push(item)
        }
        return acc
    }, [array[0]])
}

export function findMax<Type>(array:Array<Type>, compare:(first: Type, second: Type) => number): Type {
    assert(array.length > 0)
    return array.sort(compare)[0]
}