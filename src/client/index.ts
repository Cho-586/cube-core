import { createPlugin, type Plugin, type Use } from "../plugin";
import type { NodeInput, Prettify } from "../types";
import type { CubeClient, CubeClientOptions } from "./types";

const objectSort = (object: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(object).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)),
  );

function generateUrl({
  path,
  query,
  baseUrl,
}: {
  path: any[];
  query?: Record<string, any> | null;
  baseUrl: string;
}) {
  return `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}${path.join("/")}${
    !!query
      ? "?" +
        Object.entries(objectSort(query))
          .map((q) => `${q[0]}=${q[1]}`)
          .join("&")
      : ""
  }`;
}

export function createCubeClient<const I extends NodeInput<any, any, any>>(
  baseUrl: string,
): <
  const Plugins extends Plugin<string, any, any, any, any>[],
  const Use extends Plugins[number]["name"],
>(
  options?: CubeClientOptions<Plugins, Use>,
) => Prettify<CubeClient<I, Plugins, Use>> {
  return (options) => {
    const actionProps = ["get", "post", "put", "patch", "delete"];
    const handler = (path: any[]): any => {
      return new Proxy(() => {}, {
        get(_, prop: string) {
          if (actionProps.includes(prop)) {
            return (props: {
              query?: Record<string, any>;
              use?: string;
              [key: string]: any;
            }) => {
              const query = props?.query ?? null;
              const selectedPlugin = options?.plugins.find((p) =>
                props?.use ? p.name === props.use : p.name === options.use,
              );
              const cubeContext = {
                key: (args?: { withQuery: boolean; add: string[] }) => {
                  const p = [
                    ...path,
                    ...(!!(args?.withQuery && query) ? [query] : []),
                    ...(args?.add ?? []),
                  ];
                  return p;
                },
                fetch: async (args?: { body: any }) => {
                  const res = await fetch(
                    generateUrl({ path, query, baseUrl }),
                    {
                      method: prop.toUpperCase(),
                      ...(args?.body && prop !== "get"
                        ? {
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(args.body),
                          }
                        : {}),
                    },
                  );
                  const data = await res.json();
                  return data;
                },
              };
              return prop === "get"
                ? selectedPlugin?.transform(cubeContext as any).query(props)
                : selectedPlugin?.transform(cubeContext as any).mutation(props);
            };
          }
          return handler([...path, prop]);
        },
        apply(_, __, args) {
          path = [...path.slice(0, path.length - 1), args[0]];
          return handler(path);
        },
      }) as any;
    };
    return handler([]);
  };
}
