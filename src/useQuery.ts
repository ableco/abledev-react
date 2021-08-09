import { useQuery as useRQQuery } from "react-query";

type AnyFunction = (...args: any) => any;

function useQuery<QueryKey extends AnyFunction>(queryKey: QueryKey) {
  // This is not a arbitrary convertion. queryKey works differently between the TS world
  // and the runtime world:
  // - In the TS world, this is a function
  // - In the runtime world, this is a string
  const queryKeyAsString = queryKey as unknown as string;

  return useRQQuery(queryKeyAsString, async () => {
    const url = new URL(`${location.origin}/abledev/call-query`);
    url.search = new URLSearchParams({ key: queryKeyAsString }).toString();
    return fetch(url.toString()).then((response) => {
      return response.json() as ReturnType<QueryKey>;
    });
  });
}

export default useQuery;
