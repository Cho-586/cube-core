import { createCubeClient } from "./client";
import { createPlugin, type Use } from "./plugin";

// type App = {
//   actions: {
//     get: { query: { limit: number }; response: { id: number; name: string } };
//   };

//   children: {
//     id: {
//       params: number;
//       actions: {
//         get: {};
//         post: {
//           query: { role: "user" | "teacher" };
//           body: { id: string; name: string };
//           response: { message: string };
//         };
//       };
//       children: {};
//     };
//   };
// };

// const p1 = createPlugin({
//   name: "hi",
//   transform: (c) => ({
//     query: (
//       args: Partial<{
//         staleTime: number;
//       }>,
//     ) => ({
//       ...args,
//       queryKey: c.key(),
//       queryFn: c.fetch,
//     }),
//     mutation: () => ({
//       mutationFn: (vars: Use<"body">) => c.fetch({ body: vars }),
//     }),
//   }),
// });

// const client = createCubeClient<App>("localhost:5000")({
//   plugins: [
//     p1,
//     {
//       name: "mm",
//       transform: (c) => ({
//         query() {},
//         mutation() {},
//       }),
//     },
//   ],
//   use: "hi",
// });

// const a = client.id(2).get();

// console.log(a);

export * from "./plugin";
export * from "./client";
