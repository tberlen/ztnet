import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import NetworkById from "~/pages/network/[id]";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/router";
import { api } from "../../../utils/api";
import { NextIntlProvider } from "next-intl";
import enTranslation from "~/locales/en/common.json";
// function createTestContext(network?: Network) {
//   return {
//     db: prisma,
//     prisma,
//     network: network || null,
//   };
// }
jest.mock("../../../utils/api", () => ({
  api: {
    network: {
      getNetworkById: {
        useQuery: () => ({
          data: {
            network: {
              nwid: "1234567890",
              name: "Test Network",
              private: true,
              ipAssignmentPools: [
                { ipRangeStart: "10.0.0.1", ipRangeEnd: "10.0.0.254" },
              ],
              routes: [{ target: "10.0.0.0/24" }],
              dns: {
                domain: "",
                servers: [],
              },
              tags: [],
              multicastLimit: 32,
              enableBroadcast: true,
              rutes: [
                {
                  target: "172.25.28.0/24",
                  via: null,
                },
              ],
              rules: [
                {
                  not: false,
                  or: false,
                  type: "ACTION_ACCEPT",
                },
              ],
            },
            members: [],
            zombieMembers: [],
          },
          isLoading: false,
          refetch: jest.fn(),
        }),
      },
      updateNetwork: {
        useMutation: () => ({
          mutate: jest.fn(),
        }),
      },
      getFlowRule: {
        useMutation: () => ({
          mutate: jest.fn(),
        }),
      },
      setFlowRule: {
        useMutation: () => ({
          mutate: jest.fn(),
        }),
      },
      deleteNetwork: {
        useMutation: () => ({
          mutate: jest.fn(),
        }),
      },
      inviteUserByMail: {
        useMutation: () => ({
          mutate: jest.fn(),
        }),
      },
    },
    networkMember: {
      UpdateDatabaseOnly: {
        useMutation: () => ({
          mutate: jest.fn(),
        }),
      },
      create: {
        useMutation: () => ({
          mutate: jest.fn(),
        }),
      },
    },
  },
}));

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));
describe("NetworkById component", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_NODE_ENV = "test";
  });

  beforeEach(() => {
    (useRouter as jest.Mock).mockImplementation(() => ({
      query: {
        id: "test-id",
      },
    }));
  });
  it("renders loading element when data is being fetched", () => {
    const useQueryMock = jest.fn().mockReturnValue({
      data: null,
      isLoading: true,
      refetch: jest.fn(),
    });
    api.network.getNetworkById.useQuery = useQueryMock;

    render(
      <NextIntlProvider locale="en" messages={enTranslation}>
        <NetworkById />
      </NextIntlProvider>
    );
    // expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders network details correctly", () => {
    const useQueryMock = jest.fn().mockReturnValue({
      data: {
        network: {
          nwid: "1234567890",
          name: "Test Network",
          private: true,
          ipAssignmentPools: [
            { ipRangeStart: "10.0.0.1", ipRangeEnd: "10.0.0.254" },
          ],
          routes: [{ target: "10.0.0.0/24" }],
        },
        members: [],
      },
      isLoading: false,
      refetch: jest.fn(),
    });
    api.network.getNetworkById.useQuery = useQueryMock;

    render(
      <NextIntlProvider locale="en" messages={enTranslation}>
        <NetworkById />
      </NextIntlProvider>
    );
    // await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

    expect(screen.getByText(/Network ID:/i)).toBeInTheDocument();
    expect(screen.getByText(/Network Name:/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Network/i)).toBeInTheDocument();
    // expect(screen.getByText(/Network Auth/i)).toBeInTheDocument();
  });

  test("renders Network Settings divider", () => {
    render(
      <NextIntlProvider locale="en" messages={enTranslation}>
        <NetworkById />
      </NextIntlProvider>
    );
    expect(screen.getByText(/Network Settings/i)).toBeInTheDocument();
  });

  test("renders Network Members divider", () => {
    render(
      <NextIntlProvider locale="en" messages={enTranslation}>
        <NetworkById />
      </NextIntlProvider>
    );
    const matches = screen.getAllByText(/Network Members/i);
    expect(matches.length).toBe(2);
  });

  test("renders Network Start, Network End, and Network Cidr labels", () => {
    render(
      <NextIntlProvider locale="en" messages={enTranslation}>
        <NetworkById />
      </NextIntlProvider>
    );
    expect(screen.getByText(/Network Start:/i)).toBeInTheDocument();
    expect(screen.getByText(/Network End:/i)).toBeInTheDocument();
    expect(screen.getByText(/Network Cidr:/i)).toBeInTheDocument();
  });

  test("renders warning message", () => {
    render(
      <NextIntlProvider locale="en" messages={enTranslation}>
        <NetworkById />
      </NextIntlProvider>
    );
    expect(
      screen.getByText(
        /Join this network ID and the device will automatically be displayed/
      )
    ).toBeInTheDocument();
  });

  test("edit network name", async () => {
    // screen.debug();
    render(
      <NextIntlProvider locale="en" messages={enTranslation}>
        <NetworkById />
      </NextIntlProvider>
    );
    const editIcon = screen.getByTestId("changeNetworkName");
    await userEvent.click(editIcon);

    const input: HTMLInputElement = screen.getByPlaceholderText("Test Network");

    await userEvent.type(input, "New Network Name");
    expect(input).toHaveValue("Test NetworkNew Network Name");
    fireEvent.submit(input);
    // hack to hide the input by toggle the edit icon
    await userEvent.click(editIcon);

    await waitFor(() => expect(input).not.toBeInTheDocument());
  });
});
