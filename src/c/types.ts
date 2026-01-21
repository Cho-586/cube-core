export type CubeSchemaHelper = {
  /**
   * Defines a numeric field
   * @example c.number()
   */
  number: () => { _type: "number" };
  /**
   * Defines a numeric field
   * @example c.string()
   */
  string: () => { _type: "string" };
  /**
   * Defines a numeric field
   * @example c.boolean()
   */
  boolean: () => { _type: "boolean" };
  /**
   *
   * Generates a union type from the array passed in
   * @template T - The array of options or values
   */
  enum: <const T extends any[]>(
    values: T
  ) => {
    _type: "enum";
    options: T;
  };
  /**
   *
   * Creates a custom shape or nested structure
   * @template T - The type reference
   */
  shape: <const T>() => {
    _type: "generic";
    value: T;
  };
};

export type CubeType<T extends { _type: string }> = T extends {
  _type: infer Type;
}
  ? Type extends "string"
    ? string
    : Type extends "number"
    ? number
    : Type extends "boolean"
    ? boolean
    : T extends { _type: "enum"; options: infer O extends any[] }
    ? O[number]
    : T extends { _type: "generic"; value: infer V }
    ? V
    : any
  : T;
