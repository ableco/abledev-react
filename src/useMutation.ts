import { useMutation as useRQMutation, UseMutationOptions } from "react-query";
import { AnyFunction, FirstParamOrFallback } from "./ts-helpers";
import superjson from "superjson";

type OptionsFromResultAndArgsTypes<ResultType, ArgumentsType> =
  UseMutationOptions<ResultType, unknown, ArgumentsType, string>;

type OptionsFromMutationKey<MutationKey extends AnyFunction> =
  OptionsFromResultAndArgsTypes<
    ReturnType<MutationKey>,
    FirstParamOrFallback<MutationKey, object>
  >;

function useMutation<MutationKey extends AnyFunction>(
  mutationKey: MutationKey,
  mutationConfiguration: OptionsFromMutationKey<MutationKey> = {},
) {
  // This is not a arbitrary convertion. queryKey works differently between the TS world
  // and the runtime world:
  // - In the TS world, this is a function
  // - In the runtime world, this is a string
  const mutationKeyAsString = mutationKey as unknown as string;

  return useUnsweetenedMutation<
    ReturnType<MutationKey>,
    FirstParamOrFallback<MutationKey, object>
  >(mutationKeyAsString, mutationConfiguration);
}

function useUnsweetenedMutation<ResultType, ArgumentsType>(
  mutationKey: string,
  mutationConfiguration: OptionsFromResultAndArgsTypes<
    ResultType,
    ArgumentsType
  > = {},
) {
  return useRQMutation<ResultType, unknown, ArgumentsType, string>(
    mutationKey,
    async (mutationArguments) => {
      const url = new URL(`${location.origin}/abledev/call-mutation`);
      url.search = new URLSearchParams({ key: mutationKey }).toString();

      try {
        const response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: superjson.stringify(mutationArguments),
        });
        const responseText = await response.text();
        const responseData = superjson.parse(responseText);
        return responseData as ResultType;
      } catch (error) {
        throw error;
      }
    },
    mutationConfiguration,
  );
}

export { useUnsweetenedMutation };

export default useMutation;
