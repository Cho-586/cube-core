import type { CubeSchemaHelper } from "./types";

/**
 * Cube's built in type utility for defining schemas.
 * @see {@link defineCube} for how to use these schemas in a cube.
 * @example
 * ```ts
 * const todo = defineCube(':id', {
 *  param: c.number(),
 *  get: { response: c.shape<Todo>() },
 *  post: { payload: c.shape<{todo: string}>() }
 * })
 * ```
 */
export const c: CubeSchemaHelper = {
  number: () => ({ _type: "number" as const }),
  string: () => ({ _type: "string" as const }),
  boolean: () => ({ _type: "boolean" as const }),
  enum: <T>(values: T) => ({ _type: "enum" as const, options: values }),
  shape: <T>() => ({
    _type: "generic" as const,
    value: "object-type" as T,
  }),
} as const;
