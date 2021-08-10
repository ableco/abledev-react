import { useQuery as useRQQuery, UseQueryOptions } from "react-query";
import { AnyFunction, FirstParamOrFallback } from "./ts-helpers";
import superjson from "superjson";

type OptionsFromResultType<ResultType> = UseQueryOptions<
  ResultType,
  unknown,
  ResultType,
  string
>;

type OptionsFromQueryKey<QueryKey extends AnyFunction> = OptionsFromResultType<
  ReturnType<QueryKey>
>;

function useQuery<QueryKey extends AnyFunction>(
  queryKey: QueryKey,
  queryArguments?: FirstParamOrFallback<QueryKey, object>,
  queryConfiguration: OptionsFromQueryKey<QueryKey> = {},
) {
  // This is not a arbitrary convertion. queryKey works differently between the TS world
  // and the runtime world:
  // - In the TS world, this is a function
  // - In the runtime world, this is a string
  const queryKeyAsString = queryKey as unknown as string;
  return useUnsweetenedQuery<ReturnType<QueryKey>>(
    queryKeyAsString,
    queryArguments,
    queryConfiguration,
  );
}

function useUnsweetenedQuery<ResultType>(
  queryKey: string,
  queryArguments: object = {},
  queryConfiguration: OptionsFromResultType<ResultType> = {},
) {
  return useRQQuery(
    queryKey,
    async () => {
      const url = new URL(`${location.origin}/abledev/call-query`);
      url.search = new URLSearchParams({
        key: queryKey,
        ...queryArguments,
      }).toString();

      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        const responseText = await response.text();
        const responseData = superjson.parse(responseText);
        return responseData as ResultType;
      } catch (error) {
        throw error;
      }
    },
    queryConfiguration,
  );
}

export { useUnsweetenedQuery };
export default useQuery;
