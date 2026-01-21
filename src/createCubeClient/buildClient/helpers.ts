import type { BuildClientConfig, QueryObj, StateObj } from "./types";

export function ensurePropExists(
  source: Record<string, any>,
  prop: string,
  name: string
) {
  if (!source[prop] && !(source?.children ?? {})[prop] && prop !== "query") {
    throw new Error(`${prop} not found in cube: ${name}`);
  }
}

const objectSort = (object: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(object).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
  );

export function generateUrl({
  state,
  query,
  baseUrl,
}: {
  state: StateObj[];
  query?: QueryObj;
  baseUrl: string;
}) {
  return `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}${state
    .map((s) => s.arg ?? s.path)
    .join("/")}${
    !!query
      ? "?" +
        Object.entries(objectSort(query))
          .map((q) => `${q[0]}=${q[1]}`)
          .join("&")
      : ""
  }`;
}

export function generateKey({
  state,
  query,
}: {
  state: StateObj[];
  query?: QueryObj;
}) {
  const statePathArr = state.map((s) => s.arg ?? s.path);
  return query ? [...statePathArr, objectSort(query)] : statePathArr;
}

function isPlainObject(value: any) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepMerge(a: any, b: any) {
  const result = { ...a };
  for (const key in b) {
    const aVal = a[key];
    const bVal = b[key];
    if (isPlainObject(aVal) && isPlainObject(bVal)) {
      result[key] = deepMerge(aVal, bVal);
    } else {
      result[key] = bVal;
    }
  }
  return result;
}

export function resolveConfig(
  parent: any,
  child: any,
  previousConfig: any
): BuildClientConfig {
  const baseUrl: BuildClientConfig["baseUrl"] =
    child?.baseUrl ?? parent?.baseUrl ?? previousConfig?.baseUrl;
  const requestOptions: BuildClientConfig["requestOptions"] = deepMerge(
    previousConfig?.requestOptions ?? {},
    deepMerge(parent.requestOptions ?? {}, child?.requestOptions ?? {})
  );
  const extraOptions: BuildClientConfig["extraOptions"] = deepMerge(
    previousConfig?.extraOptions ?? {},
    deepMerge(parent.extraOptions ?? {}, child?.extraOptions ?? {})
  );

  return { baseUrl, requestOptions, extraOptions };
}
