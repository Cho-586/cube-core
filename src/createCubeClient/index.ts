import { defineCube } from "../defineCube";
import type { CubeDef } from "../defineCube/types";
import { resolveCube } from "./resolveCube";
import { buildClient } from "./buildClient";
import type { BuiltClient } from "./buildClient/types";
import type { CubeClientConfig } from "./types";
import type { PluginDef } from "../definePlugin/types";
import type { ResolvedCube } from "./resolveCube/types";

export function createCubeClient<
  const Plugins extends PluginDef<string, unknown, unknown>[],
  const Cubes extends CubeDef<string>[],
  const DefualtPluginName extends Plugins[number]["name"]
>(
  config: CubeClientConfig<Plugins, Cubes, DefualtPluginName>
): BuiltClient<
  ResolvedCube<{ name: "root"; children: Cubes }>,
  Plugins,
  DefualtPluginName
> {
  const { baseUrl, cubes, requestOptions, defaultMode, plugins } = config;
  const root = defineCube("root", {
    baseUrl,
    requestOptions,
    children: cubes,
  });
  return buildClient({
    cube: resolveCube(root),
    plugins,
    defaultMode,
  });
}
