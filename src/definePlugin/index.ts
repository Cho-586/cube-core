import type { PluginDef } from "./types";

/**
 *
 * @param fn - Function returned by defined plugin
 * @example
 * ```ts
 * const loggerPlugin = definePlugin(() => ({
 *  name: "plugin",
 *  onQuery: (options) => console.log(options),
 *  onMutation: (options) => console.log(options),
 * }))
 * ```
 */
export function definePlugin<
  const Name extends string,
  QueryWrapper,
  MutationWrapper,
  Options
>(
  fn: (options?: Options) => PluginDef<Name, QueryWrapper, MutationWrapper>
): (options?: Options) => PluginDef<Name, QueryWrapper, MutationWrapper> {
  return (options?: Options) => fn(options);
}
