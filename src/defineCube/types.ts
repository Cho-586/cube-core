import type { CubeType } from "../c/types";
import type { Prettify, RequestOptions } from "../types";

export type ActionDef<TMethod extends string> = {
  requestOptions?: RequestOptions;
  response?: unknown;
} & (TMethod extends "GET"
  ? {
      response: unknown;
      extraOptions?: Record<string, unknown>;
    }
  : TMethod extends "POST" | "PUT" | "PATCH"
  ? {
      payload: unknown;
      extraOptions?: Record<string, unknown>;
    }
  : {
      payload?: unknown;
      extraOptions?: Record<string, unknown>;
    });

export type CubeDef<TName extends string> = {
  name: TName;
  query?: Record<string, unknown>;
  baseUrl?: string;
  requestOptions?: RequestOptions;
  path?: string;
  get?: ActionDef<"GET">;
  post?: ActionDef<"POST">;
  put?: ActionDef<"PUT">;
  patch?: ActionDef<"PATCH">;
  delete?: ActionDef<"DELETE">;
  children?: CubeDef<string>[];
} & (TName extends `:${string}` ? { param: unknown } : {});

export type ResolveCubeTypes<T> = Prettify<{
  [K in keyof T]: T[K] extends { _type: string }
    ? CubeType<T[K]>
    : T[K] extends Record<string, infer A extends { _type: string }>
    ? CubeType<A>
    : T[K];
}>;
