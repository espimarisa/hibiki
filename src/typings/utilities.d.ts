/**
 * @file Utilities
 * @description Utility typings
 * @typedef utilities
 */

// Builds a power of 2 array
type BuildPowersOf2LengthArrays<T extends number, T extends never[][]> = T[0][T] extends never
  ? T
  : BuildPowersOf2LengthArrays<T, [[...T[0], ...T[0]], ...T]>;

// Concats largest in an array
type ConcatLargestUntilDone<T extends number, T extends never[][], T extends never[]> = T["length"] extends T
  ? T
  : [...T[0], ...T][T] extends never
  ? ConcatLargestUntilDone<T, T extends [T[0], ...infer U] ? (U extends never[][] ? U : never) : never, T>
  : ConcatLargestUntilDone<T, T extends [T[0], ...infer U] ? (U extends never[][] ? U : never) : never, [...T[0], ...T]>;

type Replace<T extends unknown[], T> = { [K in keyof T]: T };
type TupleOf<T, T extends number> = number extends T
  ? T[]
  : {
      [K in T]: BuildPowersOf2LengthArrays<K, [[never]]> extends infer U
        ? U extends never[][]
          ? Replace<ConcatLargestUntilDone<K, U, []>, T>
          : never
        : never;
    }[T];

/**
 * Creates a type for a specific range of tuples
 */

type RangeOf<T extends number> = Partial<TupleOf<unknown, T>>["length"];
