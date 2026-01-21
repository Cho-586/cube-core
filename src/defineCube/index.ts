import type { Exact } from "../types";
import type { CubeDef } from "./types";

/**
 *
 * @param name The name of the cube resource
 * @remarks Cubes with names that start with a colon are treated as dynamic. The name becomes the path of the cube url unless your specify otherwise @see {@link path overrides}
 * @param config Config options for cubes
 * @example
 * ```ts
 * const todo = defineCube(':id', { param: c.number(), get: {response: c.shape<Todo>() }})
 * const todos = defineCube('todos', {
 *  get: {response: c.shape<Todo[]>() },
 *  children: [todo]
 * })
 * const api = createCubeApi({resources: [todo]})
 * // In your component
 * const { data: todo } = api.todos.id(2).get()
 * ```
 */
export function defineCube<
  const Name extends CubeDef<string>["name"],
  const Config extends Omit<CubeDef<Name>, "name">
>(
  name: Name,
  config: Exact<Config, Omit<CubeDef<Name>, "name">>
): { name: Name } & Config {
  return { name, ...config } as any;
}
