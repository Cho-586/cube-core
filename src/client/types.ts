import type { Plugin, Use } from "../plugin";
import type { HTTPMethod, LookUp, Prettify, Replace } from "../types";

type CubeClientChildren<Input, P, U> = (Input extends { children: infer C }
  ? { [K in keyof C]: CubeClient<C[K], P, U> }
  : {}) &
  CubeClientMethods<Input, P, U>;

type CubeClientMethods<Input, P, U> = Input extends {
  actions: infer A extends Record<string, any>;
}
  ? {
      [K in keyof A as K extends Lowercase<HTTPMethod> ? K : never]: CubeFn<
        A[K],
        P,
        U
      >;
    }
  : {};

type CubeFn<A, P, U> = P extends Plugin<string, any, any, any, any>[]
  ? U extends P[number]["name"]
    ? <Use extends P[number]["name"]>(
        args?: Partial<
          (A extends { query: infer Q }
            ? Q extends Record<string, any>
              ? { query: Q }
              : {}
            : {}) & {
            use: Use;
          }
        > &
          (U extends Use ? CubeProps<A, P, U> : CubeProps<A, P, Use>),
      ) => U extends Use ? CubeAction<A, P, U> : CubeAction<A, P, Use>
    : {}
  : {};

type ResolveUndefinedToObject<T> = undefined extends T
  ? Record<never, never>
  : T;

type CubeAction<
  A,
  P extends Plugin<string, any, any, any, any>[],
  U extends P[number]["name"],
> = Replace<
  LookUp<P, "name">[U] extends Plugin<string, any, any, any, any>
    ? A extends { body: unknown }
      ? ReturnType<ReturnType<LookUp<P, "name">[U]["transform"]>["mutation"]>
      : ReturnType<ReturnType<LookUp<P, "name">[U]["transform"]>["query"]>
    : {},
  {
    response: A extends { response: infer R } ? R : {};
    body: A extends { body: infer B } ? B : {};
  }
>;
type CubeProps<
  A,
  P extends Plugin<string, any, any, any, any>[],
  U extends P[number]["name"],
> = Replace<
  LookUp<P, "name">[U] extends Plugin<string, any, any, any, any>
    ? A extends { body: unknown }
      ? ResolveUndefinedToObject<
          Parameters<
            ReturnType<LookUp<P, "name">[U]["transform"]>["mutation"]
          >[0]
        >
      : ResolveUndefinedToObject<
          Parameters<ReturnType<LookUp<P, "name">[U]["transform"]>["query"]>[0]
        >
    : {},
  {
    response: A extends { response: infer R } ? R : {};
    body: A extends { body: infer B } ? B : {};
  }
>;

export type CubeClient<Input, Plugins, Use> = Input extends {
  params: infer P;
}
  ? (args: P) => Prettify<CubeClientChildren<Input, Plugins, Use>>
  : CubeClientChildren<Input, Plugins, Use>;

export type CubeClientOptions<Plugins, Use> = {
  plugins: Plugins;
  use: Use;
};
