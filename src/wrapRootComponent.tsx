import * as React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

type TurnedOffSuspense = {
  mode: "off";
  loadingUI?: never;
};

type WithInternalLoadingStateSuspense = {
  mode: "withInternalLoadingState";
  loadingUI: React.ReactElement;
};

type WithExternalLoadingStateSuspense = {
  mode: "withExternalLoadingState";
  loadingUI?: never;
};

type Options = {
  suspense:
    | TurnedOffSuspense
    | WithInternalLoadingStateSuspense
    | WithExternalLoadingStateSuspense;
};

function wrapRootComponent<ComponentProps>(
  Component: React.FC<ComponentProps>,
  options: Options = { suspense: { mode: "off" } },
) {
  let queryClient: QueryClient;
  const { suspense } = options;

  const AbledevWrapper = (props: ComponentProps) => {
    queryClient ??= new QueryClient({
      defaultOptions: {
        queries: { suspense: suspense.mode !== "off" },
      },
    });

    return (
      <QueryClientProvider client={queryClient}>
        {suspense.mode === "withInternalLoadingState" ? (
          <React.Suspense fallback={suspense.loadingUI}>
            <Component {...props} />
          </React.Suspense>
        ) : (
          <Component {...props} />
        )}
      </QueryClientProvider>
    );
  };

  Object.defineProperty(AbledevWrapper, "name", {
    value: `AbledevWrapper(${Component.displayName ?? Component.name})`,
    configurable: true,
  });

  return AbledevWrapper;
}

export default wrapRootComponent;
