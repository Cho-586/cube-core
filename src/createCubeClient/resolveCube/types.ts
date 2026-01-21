import type { CubeDef } from "../../defineCube/types";

type ExtractName<T extends string> = T extends `:${infer I}` ? I : T;

export type ResolvedCube<T extends CubeDef<string>> = Omit<
  T,
  "children" | "name"
> & {
  kind: T["name"] extends `:${string}` ? "dynamic" : "static";
  children: T extends { children: CubeDef<string>[] }
    ? {
        [K in T["children"][number] as ExtractName<
          K["name"]
        >]: K["name"] extends `:${string}` ? ResolvedCube<K> : ResolvedCube<K>;
      }
    : {};
};
