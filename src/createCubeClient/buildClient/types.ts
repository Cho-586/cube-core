import type { CubeType } from "../../c/types";
import type {
  ActionDef,
  CubeDef,
  ResolveCubeTypes,
} from "../../defineCube/types";
import type { PluginDef } from "../../definePlugin/types";
import type { AddToGeneric, Prettify, RequestOptions } from "../../types";
import type { ResolvedCube } from "../resolveCube/types";

export type StateObj = {
  path: string;
  arg?: any;
};

export type QueryObj = Record<string, any>;
export type FnWrappers = {
  query: (options: any) => unknown;
  mutation: (options: any) => unknown;
};

export type BuildClientConfig = {
  baseUrl?: string;
  requestOptions?: RequestOptions;
  extraOptions?: Record<string, any>;
};

export type BuildClientOptions<
  Cube extends ResolvedCube<CubeDef<string>>,
  Plugins extends PluginDef<string, unknown, unknown>[],
  DefaultPluginName extends string
> = {
  state?: StateObj[];
  query?: QueryObj;
  cube: Cube;
  defaultMode: DefaultPluginName;
  plugins: Plugins;
  config?: BuildClientConfig;
};

type PluginLookUp<T extends any[]> = {
  [K in T[number] as K["name"]]: K;
};

type CubeQueryReturnOptions = {
  data: any;
};

type ResolveCubeType<T> = T extends { _type: string } ? CubeType<T> : T;
type CubeQueryResult<
  Cube extends ResolvedCube<CubeDef<string>>,
  Plugins extends PluginDef<string, unknown, unknown>[],
  Name extends string
> = Cube["get"] extends ActionDef<"GET">
  ? PluginLookUp<Plugins>[Name] extends PluginDef<string, unknown, unknown>
    ? ReturnType<
        PluginLookUp<Plugins>[Name]["onQuery"]
      > extends CubeQueryReturnOptions
      ? Omit<ReturnType<PluginLookUp<Plugins>[Name]["onQuery"]>, "data"> & {
          data: ResolveCubeType<Cube["get"]["response"]>;
        }
      : AddToGeneric<
          ReturnType<PluginLookUp<Plugins>[Name]["onQuery"]>,
          ResolveCubeType<Cube["get"]["response"]>
        >
    : {}
  : {};

type CubeMutationMethods = "post" | "put" | "patch" | "delete";

type CubeMutationReturnOptions = {
  mutate: (variables?: any) => void;
  mutateAsync: (variables?: any) => void;
  variables: any;
  data: any;
};

type CubeMutationResult<
  Action extends ActionDef<CubeMutationMethods>,
  Plugins extends PluginDef<string, unknown, unknown>[],
  Name extends string
> = Action extends ActionDef<"POST" | "PUT" | "PATCH" | "DELETE">
  ? PluginLookUp<Plugins>[Name] extends PluginDef<string, unknown, unknown>
    ? ReturnType<
        PluginLookUp<Plugins>[Name]["onMutation"]
      > extends CubeMutationReturnOptions
      ? Omit<
          ReturnType<PluginLookUp<Plugins>[Name]["onMutation"]>,
          keyof CubeMutationReturnOptions
        > & {
          data: ResolveCubeType<Action["response"]>;
          mutate: Action extends ActionDef<"DELETE">
            ? (variables?: ResolveCubeType<Action["payload"]>) => void
            : (variables: ResolveCubeType<Action["payload"]>) => void;
          mutateAsync: Action extends ActionDef<"DELETE">
            ? (variables?: ResolveCubeType<Action["payload"]>) => void
            : (variables: ResolveCubeType<Action["payload"]>) => void;
          variables: ResolveCubeType<Action["payload"]>;
        }
      : AddToGeneric<
          ReturnType<PluginLookUp<Plugins>[Name]["onQuery"]>,
          ResolveCubeType<Action["response"]>
        >
    : never
  : never;

type CubeMutation<
  Action extends ActionDef<CubeMutationMethods>,
  Plugins extends PluginDef<string, unknown, unknown>[],
  DefaultPluginName extends string
> = Action extends { [key: string]: any }
  ? Action extends { payload: infer Payload }
    ? <M extends Plugins[number]["name"]>(options?: {
        mode?: M;
        data?: Payload extends any ? ResolveCubeType<Payload> : unknown;
      }) => DefaultPluginName extends M
        ? CubeMutationResult<Action, Plugins, DefaultPluginName>
        : CubeMutationResult<Action, Plugins, M>
    : <M extends Plugins[number]["name"]>(options?: {
        mode?: M;
        data?: unknown;
      }) => DefaultPluginName extends M
        ? CubeMutationResult<Action, Plugins, DefaultPluginName>
        : CubeMutationResult<Action, Plugins, M>
  : never;

type BuiltClientActions<
  Cube extends ResolvedCube<CubeDef<string>>,
  Plugins extends PluginDef<string, unknown, unknown>[],
  DefaultPluginName extends string
> = Prettify<
  (Cube["get"] extends ActionDef<"GET">
    ? {
        get: <M extends Plugins[number]["name"]>(options?: {
          mode: M;
        }) => DefaultPluginName extends M
          ? CubeQueryResult<Cube, Plugins, DefaultPluginName>
          : CubeQueryResult<Cube, Plugins, M>;
      }
    : {}) &
    (Cube["post"] extends ActionDef<"POST">
      ? {
          post: CubeMutation<Cube["post"], Plugins, DefaultPluginName>;
        }
      : {}) &
    (Cube["put"] extends ActionDef<"PUT">
      ? {
          put: CubeMutation<Cube["put"], Plugins, DefaultPluginName>;
        }
      : {}) &
    (Cube["patch"] extends ActionDef<"PATCH">
      ? {
          patch: CubeMutation<Cube["patch"], Plugins, DefaultPluginName>;
        }
      : {}) &
    (Cube["delete"] extends ActionDef<"DELETE">
      ? {
          delete: CubeMutation<Cube["delete"], Plugins, DefaultPluginName>;
        }
      : {})
>;

export type BuiltClient<
  Cube extends ResolvedCube<CubeDef<string>>,
  Plugins extends PluginDef<string, unknown, unknown>[],
  DefaultPluginName extends string
> = (Cube["children"] extends Record<string, any>
  ? {
      [K in keyof Cube["children"]]: Cube["children"][K] extends {
        kind: "dynamic";
      }
        ? (
            value: CubeType<Cube["children"][K]["param"]>
          ) => BuiltClient<
            Cube["children"][`${K extends string ? K : ""}`],
            Plugins,
            DefaultPluginName
          >
        : BuiltClient<Cube["children"][K], Plugins, DefaultPluginName>;
    }
  : {}) &
  BuiltClientActions<Cube, Plugins, DefaultPluginName> &
  (Cube["query"] extends Record<string, any>
    ? {
        query: (
          options?: Prettify<Partial<ResolveCubeTypes<Cube["query"]>>>
        ) => BuiltClientActions<Cube, Plugins, DefaultPluginName>;
      }
    : {});
