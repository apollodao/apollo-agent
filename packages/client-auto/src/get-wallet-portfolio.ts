import { elizaLogger, IAgentRuntime } from "@elizaos/core";
import {
    BirdeyeProvider,
    WalletPortfolioResponse,
} from "@elizaos/plugin-birdeye";
import { APOLLO_TRADING_ROOM_ID, CHAIN_ID } from "./constants";

export const getWalletPortfolio = async (
    runtime: IAgentRuntime,
    walletAddress: string
): Promise<WalletPortfolioResponse> => {
    const provider = new BirdeyeProvider(runtime.cacheManager);
    const response: WalletPortfolioResponse =
        await provider.fetchWalletPortfolio(
            {
                wallet: walletAddress,
            },
            {
                headers: {
                    chain: CHAIN_ID,
                },
            }
        );

    elizaLogger.info("Response: ", JSON.stringify(response, null, 2));

    if (!response) {
        throw new Error("No result found");
    }

    return response;
};

export const getTokenOverview = async (
    runtime: IAgentRuntime,
    address: string
) => {
    const provider = new BirdeyeProvider(runtime.cacheManager);
    const response = await provider.fetchTokenOverview(
        {
            address,
        },
        {
            headers: {
                chain: CHAIN_ID,
            },
        }
    );
    return response;
};

export const getMetadata = async (runtime: IAgentRuntime, address: string) => {
    const provider = new BirdeyeProvider(runtime.cacheManager);
    const response = await provider.fetchTokenMetadataSingle(
        {
            address,
        },
        {
            headers: {
                chain: CHAIN_ID,
            },
        }
    );
    return response;
};

export const getTokenSecurity = async (
    runtime: IAgentRuntime,
    address: string
) => {
    const provider = new BirdeyeProvider(runtime.cacheManager);
    const response = await provider.fetchTokenSecurityByAddress(
        {
            address,
        },
        {
            headers: {
                chain: CHAIN_ID,
            },
        }
    );
    return response;
};

export const getTokenTradeData = async (
    runtime: IAgentRuntime,
    address: string
) => {
    const provider = new BirdeyeProvider(runtime.cacheManager);
    const response = await provider.fetchTokenTradeDataSingle(
        {
            address,
        },
        {
            headers: {
                chain: CHAIN_ID,
            },
        }
    );
    return response;
};

export const createMemory = async (runtime: IAgentRuntime, message: string) => {
    return await runtime.messageManager.createMemory({
        id: crypto.randomUUID(),
        userId: runtime.agentId,
        agentId: runtime.agentId,
        roomId: APOLLO_TRADING_ROOM_ID,
        content: {
            text: message,
        },
        createdAt: Date.now(),
    });
};
