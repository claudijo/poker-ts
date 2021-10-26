export declare function shuffle<Type>(array: Type[]): void;
export declare function findIndexAdjacent<Type>(array: Type[], predicate: (first: Type, second: Type) => boolean): number;
export declare function nextOrWrap<Type>(array: (Type | null)[], currentIndex: any): number;
export declare function rotate(array: any[], count: number): void;
export declare function unique<Type>(array: Type[], predicate?: (first: Type, second: Type) => boolean): Type[];
export declare function findMax<Type>(array: Type[], compare: (first: Type, second: Type) => number): Type;
