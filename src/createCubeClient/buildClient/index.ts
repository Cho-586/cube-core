import type { CubeDef } from "../../defineCube/types";
import type { ResolvedCube } from "../resolveCube/types";
import type { BuildClientOptions, BuiltClient } from "./types";
import {
  deepMerge,
  ensurePropExists,
  generateKey,
  generateUrl,
  resolveConfig,
} from "./helpers";
import type { PluginDef } from "../../definePlugin/types";

const actionProps = ["get", "post", "put", "patch", "delete"] as const;

type ActionProps = (typeof actionProps)[number];

export function buildClient<
  const Cube extends ResolvedCube<CubeDef<string>>,
  const Plugins extends PluginDef<string, unknown, unknown>[],
  const DefualtPluginName extends string
>({
  cube,
  state = [],
  ...rest
}: BuildClientOptions<Cube, Plugins, DefualtPluginName>): BuiltClient<
  Cube,
  Plugins,
  DefualtPluginName
> {
  const { query, plugins, defaultMode, config } = rest;
  return new Proxy(() => {}, {
    get(_, prop: ActionProps | (string & {})) {
      // Ensures prop (sub resource or action) is defined in the parent cube
      ensurePropExists(cube, prop, state.map((s) => s.path).join("."));
      // Extracts the values of the child prop
      const childCube = ((cube?.children ?? {}) as any)[prop];
      // Add prop to state
      const newState = [...state, { path: prop }];
      // Handle actions
      if (
        actionProps.includes(prop as ActionProps) &&
        cube[prop as ActionProps]
      ) {
        const key = generateKey({ state, query });
        const url = generateUrl({
          state,
          query,
          baseUrl: config?.baseUrl ?? "",
        });
        const defaultPlugin = plugins.find((p) => p.name === defaultMode);
        if (prop === "get") {
          return (options?: { mode?: string }) =>
            (
              plugins.find((p) => p.name === options?.mode) ?? defaultPlugin
            )?.onQuery({
              key,
              url,
              requestOptions: deepMerge(
                deepMerge(config?.requestOptions!, {
                  method: "GET",
                }),
                (cube as any)[prop]?.requestOptions ?? {}
              ),
              extraOptions: (cube as any)[prop]?.extraOptions ?? {},
            });
        } else if (
          prop === "post" ||
          prop === "patch" ||
          prop === "put" ||
          prop === "delete"
        ) {
          return (options?: { mode?: string; data: unknown }) =>
            (
              plugins.find((p) => p.name === options?.mode) ?? defaultPlugin
            )?.onMutation({
              data: options?.data,
              url,
              key,
              requestOptions: deepMerge(
                deepMerge(config?.requestOptions!, {
                  method: prop.toUpperCase(),
                }),
                (cube as any)[prop]?.requestOptions ?? {}
              ),
              extraOptions: (cube as any)[prop]?.extraOptions ?? {},
            });
        }
      }
      // Handle query props
      if (prop === "query") {
        return buildClient({
          cube,
          state,
          ...rest,
          query: {},
        });
      }
      // Rerun the proxy for child props
      return buildClient({
        cube: childCube!,
        state: newState,
        ...rest,
        config: resolveConfig(cube, childCube, config),
      });
    },
    apply(_, __, args) {
      if (query) {
        if (cube.query) {
          return buildClient({
            cube,
            state,
            ...rest,
            query: args[args.length - 1],
          });
        }
        throw new Error(
          `Cube: api.${state
            .map((s) => s.path)
            .join(".")} has no definition for query params`
        );
      }
      const lastState = state[state.length - 1];
      if ((cube as any).kind !== "dynamic") {
        throw new Error(
          `Cube: api.${state.map((s) => s.path).join(".")} is not dynamic`
        );
      }
      return buildClient({
        cube,
        state: [
          ...state.slice(0, state.length - 1),
          { ...lastState!, arg: args[args.length - 1] },
        ],
        ...rest,
      });
    },
  }) as any;
}
