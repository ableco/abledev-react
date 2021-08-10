import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import wrapRootComponent from "./wrapRootComponent";
import { setupServer } from "msw/node";
import { rest } from "msw";
import { useUnsweetenedMutation } from "./useMutation";
import { useUnsweetenedQuery } from "./useQuery";
import { QueryClient, useQueryClient as useRQQueryClient } from "react-query";
import { AnyFunction } from "./ts-helpers";

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

let serverData: { numbers: Array<number> } = {
  numbers: [],
};

const server = setupServer(
  rest.post("/abledev/call-mutation", (req, res, ctx) => {
    const key = req.url.searchParams.get("key");

    if (key === "mutations/push-next") {
      const { numbers } = serverData;
      serverData.numbers.push((numbers[numbers.length - 1] ?? 0) + 1);
    }

    if (key === "mutations/push") {
      const newNumber = (req.body as any).number as number;
      serverData.numbers.push(newNumber);
    }

    return res(ctx.json({}));
  }),
  rest.get("/abledev/call-query", (_req, res, ctx) => {
    return res(ctx.json(serverData.numbers));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const TestComponent = wrapRootComponent(() => {
  const { isLoading, data } = useUnsweetenedQuery("queries/get-all");
  const { invalidateQueryKey } = useQueryClient();

  const pushNextMutation = useUnsweetenedMutation("mutations/push-next", {
    onSettled: () => {
      invalidateQueryKey("queries/get-all");
    },
  });
  const pushMutation = useUnsweetenedMutation("mutations/push", {
    onSettled: () => {
      invalidateQueryKey("queries/get-all");
    },
  });

  const [newNumber, setNewNumber] = React.useState(99);

  return (
    <>
      <button onClick={() => pushNextMutation.mutate({})}>Push Next</button>

      <input
        type="text"
        value={newNumber.toString()}
        onChange={(event) => {
          setNewNumber(Number(event.target.value));
        }}
        placeholder="New Number"
      />
      <button onClick={() => pushMutation.mutate({ number: newNumber })}>
        Push
      </button>
      <div>
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <span>{JSON.stringify(data as object)}</span>
        )}
      </div>
    </>
  );
});

test("It calls a server and updates something", async () => {
  render(<TestComponent />);
  fireEvent.click(screen.getByRole("button", { name: "Push Next" }));
  fireEvent.click(screen.getByRole("button", { name: "Push Next" }));
  expect(await screen.findByText("[1,2]"));
});

test("It can receive some arguments", async () => {
  serverData.numbers = [];

  render(<TestComponent />);
  fireEvent.change(screen.getByPlaceholderText("New Number"), {
    target: { value: "199" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Push" }));
  expect(await screen.findByText("[199]"));
});
