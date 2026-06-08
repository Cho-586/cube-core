import type { Use } from "./plugin";

export type NodeInput<
  Param,
  Actions,
  Children extends
    | Record<string, NodeInput<unknown, unknown, unknown>>
    | unknown,
> = {
  children?: Children;
  param?: Param;
  actions?: Actions;
};

export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Replace<
  T extends any,
  R extends Record<string, unknown>,
> = T extends undefined | null
  ? T
  : T extends { _placeholder: infer U }
    ? U extends keyof R
      ? Readonly<any> extends T
        ? Readonly<R[U]>
        : R[U]
      : T
    : T extends Promise<infer P>
      ? Promise<Replace<P, R>>
      : T extends Array<infer A>
        ? Array<Replace<A, R>>
        : T extends Set<infer S>
          ? Set<Replace<S, R>>
          : T extends Map<infer K, infer V>
            ? Map<K, Replace<V, R>>
            : T extends (...args: infer A) => infer R_Type
              ? (
                  ...args: { [K in keyof A]: Replace<A[K], R> }
                ) => Replace<R_Type, R>
              : T extends object
                ? {
                    [K in keyof T]: Replace<T[K], R>;
                  } & {}
                : T;

export type LookUp<T extends any[], Key extends string> = {
  [K in T[number] as K[Key]]: K;
};
