import * as React from "react";
import { render, screen } from "@testing-library/react";
import { useUnsweetenedQuery } from "./useQuery";
import wrapRootComponent from "./wrapRootComponent";
import { setupServer } from "msw/node";
import { rest } from "msw";
import superjson from "superjson";

const server = setupServer(
  rest.get("/abledev/call-query", (req, res, ctx) => {
    const response: any = { key: req.url.searchParams.get("key") };
    if (req.url.searchParams.get("name")) {
      response.name = req.url.searchParams.get("name");
    }
    return res(ctx.text(superjson.stringify(response)));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const TestComponent = wrapRootComponent(() => {
  const { isLoading, data } = useUnsweetenedQuery("queries/something");

  return isLoading ? (
    <span>loading...</span>
  ) : (
    <>
      <span>done</span>
      <span>{JSON.stringify(data as object)}</span>
    </>
  );
});

const SuspenseTestComponent = () => {
  const { data } = useUnsweetenedQuery("queries/something");
  return (
    <>
      <span>done</span>
      <span>{JSON.stringify(data as object)}</span>
    </>
  );
};

const InternalSuspenseTestComponent = wrapRootComponent(SuspenseTestComponent, {
  suspense: {
    mode: "withInternalLoadingState",
    loadingUI: <span>loading...</span>,
  },
});

const ExternalSuspenseTestComponent = wrapRootComponent(SuspenseTestComponent, {
  suspense: {
    mode: "withExternalLoadingState",
  },
});

const ParameterizedComponent = wrapRootComponent(
  ({ name }: { name: string }) => {
    const { isLoading, data } = useUnsweetenedQuery("queries/something", {
      name,
    });

    return isLoading ? (
      <span>loading...</span>
    ) : (
      <>
        <span>done</span>
        <span>{JSON.stringify(data as object)}</span>
      </>
    );
  },
);

test("It calls a server", async () => {
  render(<TestComponent />);
  expect(screen.getByText("loading...")).toBeInTheDocument();
  expect(await screen.findByText("done")).toBeInTheDocument();
  expect(await screen.findByText(/queries\/something/)).toBeInTheDocument();
});

test("It shows a loading UI if suspense with internal loading state", async () => {
  render(<InternalSuspenseTestComponent />);
  expect(screen.getByText("loading...")).toBeInTheDocument();
  expect(await screen.findByText("done")).toBeInTheDocument();
  expect(await screen.findByText(/queries\/something/)).toBeInTheDocument();
});

test("It requires to be wrapped in Suspense if suspense with external state", async () => {
  expectToThrow(() => {
    render(<ExternalSuspenseTestComponent />);
  });

  render(
    <React.Suspense fallback={<span>loading...</span>}>
      <ExternalSuspenseTestComponent />
    </React.Suspense>,
  );

  expect(screen.getByText("loading...")).toBeInTheDocument();
  expect(await screen.findByText("done")).toBeInTheDocument();
  expect(await screen.findByText(/queries\/something/)).toBeInTheDocument();
});

test("It can receive some arguments", async () => {
  render(<ParameterizedComponent name="Rare name" />);
  expect(await screen.findByText(/Rare name/)).toBeInTheDocument();
});

const expectToThrow = (func: Function) => {
  // Even though the error is caught, it still gets printed to the console
  // so we mock that out to avoid the wall of red text.
  const spy = jest.spyOn(console, "error");
  spy.mockImplementation(() => {});
  expect(func).toThrow();
  spy.mockRestore();
};
