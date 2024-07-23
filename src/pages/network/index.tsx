import { type ReactElement } from "react";
import { LayoutAuthenticated } from "~/components/layouts/layout";
import type { NextPageWithLayout } from "../_app";
import { api } from "~/utils/api";
import { NetworkTable } from "../../components/networkPage/networkTable";
import { globalSiteTitle } from "~/utils/global";
import { useTranslations } from "next-intl";
import { getServerSideProps } from "~/server/getServerSideProps";
import useOrganizationWebsocket from "~/hooks/useOrganizationWebsocket";
import NetworkLoadingSkeleton from "~/components/shared/networkLoadingSkeleton";
import MetaTags from "~/components/shared/metaTags";
import {
        useTrpcApiErrorHandler,
        useTrpcApiSuccessHandler,
} from "~/hooks/useTrpcApiHandler";
import Link from "next/link";
import { User } from "@prisma/client";
import { useRouter } from "next/router";

type OrganizationId = {
        id: string;
};
interface IProps {
        orgIds: OrganizationId[];
        user: User;
}

const title = `${globalSiteTitle} - Local Controller`;



const Networks: NextPageWithLayout = ({ orgIds, user }: IProps) => {
        const b = useTranslations("commonButtons");
        const t = useTranslations("networks");
        const router = useRouter();

        const handleApiError = useTrpcApiErrorHandler();
        const handleApiSuccess = useTrpcApiSuccessHandler();

        useOrganizationWebsocket(orgIds);

        const {
                data: userNetworks,
                isLoading,
                refetch,
        } = api.network.getUserNetworks.useQuery({
                central: false,
        });

        const { data: unlinkedNetworks } = api.admin.unlinkedNetwork.useQuery(
                { getDetails: false },
                {
                        enabled: user?.role === "ADMIN",
                },
        );

        const { mutate: createNetwork } = api.network.createNetwork.useMutation({
                onError: handleApiError,
                onSuccess: handleApiSuccess({ actions: [refetch] }),
        });

        const addNewNetwork = () => {
                createNetwork(
                        { central: false },
                        {
                                onSuccess: (createdNetwork) => {
                                        if (createdNetwork?.id) {
                                                return void router.push(`/network/${createdNetwork.id}`);
                                        }
                                        void refetch();
                                },
                        },
                );
        };

        if (isLoading) {
                return (
                        <>
                                <MetaTags title={title} />
                                <NetworkLoadingSkeleton />
                        </>
                );
        }

        return (
                <div className="animate-fadeIn">
                        <MetaTags title={title} />
                        <main className="w-full bg-base-100">
                                <div className="mb-3 mt-3 flex w-full justify-center ">
                                </div>

                        </main>
                </div>
        );
};

Networks.getLayout = function getLayout(page: ReactElement) {
        return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};
export { getServerSideProps };
export default Networks;
