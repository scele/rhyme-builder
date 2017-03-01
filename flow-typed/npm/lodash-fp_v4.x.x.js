// flow-typed signature: eeca32120ccf3bb8d7b4df38c6fdb617
// flow-typed version: 12af8270f6/lodash_v4.x.x/flow_>=v0.38.x

declare module 'lodash/fp' {
  declare type NestedArray<T> = Array<Array<T>>;

  declare type matchesIterateeShorthand = Object;
  declare type matchesPropertyIterateeShorthand = [string, any];
  declare type propertyIterateeShorthand = string;

  declare type OPredicate<A, O> =
    | ((value: A, key: string, object: O) => any)
    | matchesIterateeShorthand
    | matchesPropertyIterateeShorthand
    | propertyIterateeShorthand;

  declare type OIterateeWithResult<V, O, R> = Object|string|((value: V, key: string, object: O) => R);
  declare type OIteratee<O> = OIterateeWithResult<any, O, any>;
  declare type OFlatMapIteratee<T, U> = OIterateeWithResult<any, T, Array<U>>;

  declare type Predicate<T> =
    | ((value: T, index: number, array: Array<T>) => any)
    | matchesIterateeShorthand
    | matchesPropertyIterateeShorthand
    | propertyIterateeShorthand;

  declare type _Iteratee<T> = (item: T, index: number, array: ?Array<T>) => mixed;
  declare type Iteratee<T> = _Iteratee<T>|Object|string;
  declare type Iteratee2<T, U> = ((item: T, index: number, array: ?Array<T>) => U)|Object|string;
  declare type FlatMapIteratee<T, U> = ((item: T, index: number, array: ?Array<T>) => Array<U>)|Object|string;
  declare type Comparator<T> = (item: T, item2: T) => bool;

  declare type MapIterator<T,U> =
    | ((item: T, index: number, array: Array<T>) => U)
    | propertyIterateeShorthand;

  declare type OMapIterator<T,O,U> =
    | ((item: T, key: string, object: O) => U)
    | propertyIterateeShorthand;

  declare class Lodash {
    flow(...funcs?: Array<Function>): Function;
    flow(funcs?: Array<Function>): Function;
    keys(object?: ?Object): Array<string>;
    filter<T>(predicate: Predicate<T>): (array: ?Array<T>) => Array<T>;
    filter<A, T: {[id: string]: A}>(predicate: OPredicate<A, T>): (object: T) => Array<A>;
    find<T>(predicate: Predicate<T>): (array: ?Array<T>) => T;
    find<V, A, T: {[id: string]: A}>(predicate: OPredicate<A, T>): (object: T) => V;
    includes<T>(value: T): (array: ?Array<T>,) => bool;
    includes<T: Object>(value: any): (object: T) => bool;
    includes(value: string): (str: string) => bool;
    includesFrom<T>(value: T): (fromIndex: number) => (array: ?Array<T>) => bool;
    includesFrom<T: Object>(value: any): (fromIndex: number) => (object: T) => bool;
    includesFrom(value: string): (fromIndex: number) => (str: string) => bool;
    map<T, U>(iteratee: MapIterator<T, U>): (array: ?Array<T>) => Array<U>;
    map<V, T: Object, U>(iteratee: OMapIterator<V, T, U>): (object: ?T) => Array<U>;
    map(iteratee: (char: string, index: number, str: string) => any): (str: ?string) => string;
    mapValues(iteratee: OIteratee<*>): (object: ?Object) => Object;
    flatten<T,X>(array: Array<Array<T>|X>): Array<T|X>;
    uniq<T>(array: ?Array<T>): Array<T>;
    uniqBy<T>(iteratee: Iteratee<T>): (array: ?Array<T>) => Array<T>;
    zipObject(props: Array<any>): (values: Array<any>) => Object;
    orderBy<T>(iteratees: Iteratee<T>|Array<Iteratee<T>>|string, orders?: Array<'asc'|'desc'>|string): (array: ?Array<T>) => Array<T>;
    orderBy<V, T: Object>(iteratees: OIteratee<*>|Array<OIteratee<*>>|string, orders?: Array<'asc'|'desc'>|string): (object: T) => Array<V>;
    reduce<T: Object, U>(iteratee: (accumulator: U, value: any) => U): (accumulator: U) => (object: T) => U;
    reduce<T, U>(iteratee: (accumulator: U, value: T) => U): (accumulator: U) => (array: ?Array<T>) => U;
    reduceRight<T, U>(iteratee: (accumulator: U, value: T) => U): (accumulator: U) => (array: ?Array<T>) => U;
    reduceRight<T: Object, U>(iteratee: (accumulator: U, value: any) => U): (accumulator: U) => (object: T) => U;
    transform(iteratee: OIteratee<*>): (accumulator: any) => (collection: Object|Array<any>) => any;
    drop<T>(n: number): (array: ?Array<T>) => Array<T>;
    reverse<T>(array: ?Array<T>): Array<T>;
    take<T>(n: number): (array: ?Array<T>) => Array<T>;
    values(object?: ?Object): Array<any>;
    keyBy<T, V>(iteratee: Iteratee2<T, V>): (array: ?Array<T>) => {[key: V]: T};
    keyBy<V, T: Object>(iteratee: OIteratee<T>): (object: T) => Object;
    groupBy<T>(iteratee: Iteratee<T>): (array: ?Array<T>) => Object;
    groupBy<T: Object>(iteratee?: OIteratee<T>): (object: T) => Object;
}

  declare var exports: Lodash;
}