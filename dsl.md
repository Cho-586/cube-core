```ts
/* --- Dsl 1 --- */
const plugin = (qc: QueryClient) =>
  createPlugin({
    name: "r-query",
    transform: ({ query, ...c }) => ({
      query: (
        args: Omit<Partial<CreateQueryOptions>, "queryKey" | "queryFn">,
      ) => ({ queryKey: c.key({ query }), queryFn: c.fetch, ...args }),
      mutation: (args: Omit<Partial<CreateMutationOptions>, "mutationFn">) => ({
        ...args,
        mutationFn: (vars: Use<"body">) => c.fetch({ body: vars }),
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: c.key() });
          args.onSuccess();
        },
      }),
    }),
  });
```
