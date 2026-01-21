import type { CubeDef } from "../defineCube/types";
import type { PluginDef } from "../definePlugin/types";
import type { RequestOptions } from "../types";

export type CubeClientConfig<
  Plugins extends PluginDef<string, unknown, unknown>[],
  Cubes extends CubeDef<string>[],
  DefualtPluginName extends Plugins[number]["name"]
> = {
  baseUrl?: string;
  requestOptions?: RequestOptions;
  plugins: Plugins;
  defaultMode: DefualtPluginName;
  cubes: Cubes;
};