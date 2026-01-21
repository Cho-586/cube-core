import type { CubeDef } from "../../defineCube/types";
import type { Prettify } from "../../types";
import type { ResolvedCube } from "./types";

export function resolveCube<const T extends CubeDef<string>>(
  resource: T
): Prettify<ResolvedCube<T>> {
  const { children, ...rest } = resource;
  let childrenObj: any = {};
  // Resolve child cubes
  if (children) {
    childrenObj = children?.reduce((acc, cur) => {
      const { name, ...values } = cur;
      const kind = getKind(name);
      const resolved = { ...values, kind };
      acc[resolveName(name)] = resolveCube(resolved as any);
      return acc;
    }, {} as any);
  }

  return (
    !!Object.keys(childrenObj ?? {}).length
      ? { ...rest, children: childrenObj }
      : { ...rest }
  ) as any;
}

function getKind(name: string) {
  return name.startsWith(":") ? "dynamic" : "static";
}

function resolveName(name: string) {
  return name.startsWith(":") ? name.replace(":", "") : name;
}
