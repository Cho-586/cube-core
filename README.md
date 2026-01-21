# @cube/core

Example

### cubes.ts

```ts
type Todo = {
  id: number;
  text: string;
  isCompleted: boolean;
};

const todoCube = defineCube(":id", {
  get: { response: c.shape<Todo>() },
  post: { payload: c.shape<{ text: string }>() },
});
const todosCube = defineCube("todo", {
  get: { response: c.shape<Todo[]>() },
  delete: {},
  children: [todoCube],
});
```

### plugins.ts

```ts
import { definePlugin } from "@cube/core";
import {
  createMutation,
  createQuery,
  type QueryClient,
  useQueryClient,
} from "@tanstack/svelte-query";

type SvelteQueryPluginOptions = {
  queryClient: QueryClient;
};

export const svelteQueryPlugin = definePlugin(() => ({
  name: "s-query",
  onQuery: (options) =>
    createQuery(() => ({
      queryKey: options.key,
      queryFn: async () =>
        await fetch(options.url, options.requestOptions).then((r) => r.json()),
    })),
  onMutation: (options) => {
    const queryClient = useQueryClient();
    const mutation = createMutation(() => ({
      mutationFn: (data: unknown) =>
        fetch(
          options.requestOptions.method !== "DELETE"
            ? options.url
            : `${options.url}/${data}`,
          {
            ...options.requestOptions,
            body:
              options.requestOptions.method !== "DELETE"
                ? JSON.stringify(data)
                : "",
          }
        ),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: options.key });
      },
    }));
    return mutation;
  },
}));

export const fetchPlugin = definePlugin(() => ({
  name: "fetch",
  onQuery: async (options) => {
    const res = await fetch(options.url);
    const data = await res.json();
    return data;
  },
  onMutation: async (options) => {
    const res = await fetch(options.url, {
      ...options.requestOptions,
      body: JSON.stringify(options.data),
    });
    const data = await res.json();
    return data;
  },
}));
```

### api.ts

```ts
const api = createCubeClient({
  baseUrl: "http://localhost:3000",
  requestOptions: { headers: { "Content-Type": "application/json" } },
  cubes: [todosCube],
  plugins: [fetchPlugin(), svelteQueryPlugin()],
  defaultMode: "fetch",
});
```

### app.svelte

```ts
<script type="ts">
import { api } from './api.ts'

const todosQuery = api.todos.get({ mode: 's-query' })
/* CreateQueryResult<any, Error, ...> & {
data: Todo[]
} */
const firstTodoQuery = api.todos.id(1).get({mode: 's-query'}) /* CreateQueryResult<any, Error, ...> & {
data: Todo
} */

$effect(() => {
  async function logTodos() {
     console.log((await api.todos.get())) // Normal fetch because the defualt mode was set to fetch in createCubeClient
  }
  logTodos()
})
</script>
```
