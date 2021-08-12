# Abledev React

This library provides some hooks and a HOC to use inside an abledev isolated
component. `useQuery` and `useMutation` are wrappers around
[react-query](https://react-query.tanstack.com) that offers the following
experience:

```ts
import loadData from "./queries/loadData";

const { data } = useQuery(loadData);
```

which it's not possible with regular `useQuery`.

This also provides a HOC called `wrapRootComponent` that marks a component as
the root of the isolated component. This serves 2 purposes:

1. Streamline the inclusion of React Query's `QueryClientProvider`, which would
   require the user to create 2 components with some specific behavior.
2. Provide a central way to configure react-related behavior such as `suspense`.
