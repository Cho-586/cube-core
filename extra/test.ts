import { c } from "../src";
import { createCubeClient } from "../src";
import { defineCube } from "../src";
import { definePlugin } from "../src";

const fetchPlugin = definePlugin(() => ({
  name: "fetch",
  onQuery: (options) => console.log(options?.requestOptions),
  onMutation: (options) => {
    console.log(options?.data);
  },
}));

const fetchPlugin2 = definePlugin(() => ({
  name: "fetch2",
  onQuery: (options) => console.log(options),
  onMutation: (options) => console.log(options),
}));

const todosCube = defineCube("todos", {
  requestOptions: {
    headers: {
      Authorization: "Bearer 123",
    },
  },
  query: { limit: c.number(), amount: c.string() },
  get: { response: c.shape<{ id: string }>() },
  post: {
    payload: c.shape<{ id: string }>(),
    response: c.shape<{ id: string }>(),
  },
  children: [
    defineCube(":id", {
      param: c.number(),
      get: {
        response: c.enum([1, 2, 3]),
        requestOptions: { headers: { "Content-Type": "text/html" } },
        extraOptions: { hi: 1 },
      },
      query: { dataLimit: c.enum(["name-only", "everything"]), a: c.string() },
      children: [
        defineCube("posts", {
          get: {
            response: c.enum([1, 2, 3]),
            requestOptions: { headers: { "Content-Type": "application/xml" } },
            extraOptions: { hi: 1 },
          },
        }),
      ],
    }),
  ],
});

const api = createCubeClient({
  baseUrl: "http://localhost:3000",
  defaultMode: "fetch2",
  plugins: [fetchPlugin(), fetchPlugin2()],
  requestOptions: {
    headers: { "Content-Type": "application/json" },
  },
  cubes: [todosCube],
});

api.todos.post();
