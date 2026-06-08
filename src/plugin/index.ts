export type Use<I extends "body" | "response"> = { _placeholder: I };

type CubeContext = {
  key: (args?: Partial<{ withQuery: boolean; add: unknown[] }>) => unknown[];
  fetch: (args?: Partial<{ body: Use<"body"> }>) => Use<"response">;
};

export type Plugin<
  Name,
  QueryOptions,
  QueryResult,
  MutationOptions,
  MutationResult,
> = {
  name: Name;
  transform: (c: CubeContext) => {
    query: (options: QueryOptions) => QueryResult;
    mutation: (options: MutationOptions) => MutationResult;
  };
};

export function createPlugin<
  const Name,
  QueryOptions extends Record<string, any>,
  QueryResult,
  MutationOptions extends Record<string, any>,
  MutationResult,
>(
  props: Plugin<
    Name,
    QueryOptions,
    QueryResult,
    MutationOptions,
    MutationResult
  >,
): Plugin<Name, QueryOptions, QueryResult, MutationOptions, MutationResult> {
  return props;
}
