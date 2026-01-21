export type ContentType =
  | "application/json"
  | "application/xml"
  | "text/html"
  | "text/plain"
  | "multipart/form-data"
  | (string & {});

export type Methods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Headers = RequestInit["headers"] & {
  "Content-Type"?: ContentType;
  Authorization?: `Bearer ${string}` | `Basic ${string}`;
};

export type RequestOptions = Partial<
  {
    headers: Headers;
  } & Omit<RequestInit, "body" | "method">
>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Exact<T, Base> = {
  [K in keyof T]: K extends keyof Base ? T[K] : never;
};

export type AddToGeneric<T, B> = T extends
  | Array<any>
  | Set<any>
  | Map<any, any>
  | Promise<any>
  ? T extends Array<any>
    ? Array<B>
    : T extends Promise<any>
    ? Promise<B>
    : T extends Set<any>
    ? Set<B>
    : T extends Map<infer K, any>
    ? Map<K, B>
    : T extends Record<string, any>
    ? Record<string, B>
    : B
  : B;
