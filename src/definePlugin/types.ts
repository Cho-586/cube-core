export type PluginDef<Name, QueryWrapper, MutationWrapper> = {
  name: Name;
  onQuery: (options: QueryOptions) => QueryWrapper;
  onMutation: (options: MutationOptions) => MutationWrapper;
};

type QueryOptions = {
  key: any[];
  url: string;
  requestOptions: Record<string, any>;
  extraOptions: Record<string, any>;
};

type MutationOptions = QueryOptions & { data: unknown };
