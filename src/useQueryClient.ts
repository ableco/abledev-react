import { QueryClient } from "react-query";
import { AnyFunction } from "./ts-helpers";
import { useQueryClient as useRQQueryClient } from "react-query";

interface ExtendedQueryClient extends QueryClient {
  invalidateQuery: (queryKey: AnyFunction) => void;
  invalidateQueryKey: (queryKey: string) => void;
}

function useQueryClient(
  ...args: Parameters<typeof useRQQueryClient>
): ExtendedQueryClient {
  const client = useRQQueryClient(...args) as ExtendedQueryClient;

  client.invalidateQueryKey = function (queryKey: string) {
    this.invalidateQueries(queryKey);
  };
  client.invalidateQuery = function (queryKey: AnyFunction) {
    // This is not a arbitrary convertion. queryKey works differently between the TS world
    // and the runtime world:
    // - In the TS world, this is a function
    // - In the runtime world, this is a string
    const queryKeyAsString = queryKey as unknown as string;
    this.invalidateQueryKey(queryKeyAsString);
  };

  client.invalidateQueryKey = client.invalidateQueryKey.bind(client);
  client.invalidateQuery = client.invalidateQuery.bind(client);

  return client;
}

export default useQueryClient;
