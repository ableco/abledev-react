import * as React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

function wrapRootComponent(Component: React.FC) {
  const AbledevWrapper = (props: any) => {
    return (
      <QueryClientProvider client={queryClient}>
        <Component {...props} />
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
