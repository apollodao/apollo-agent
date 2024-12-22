import {
    IAgentRuntime,
    Memory,
    Provider,
    State,
    elizaLogger,
} from "@elizaos/core";

interface TrendingToken {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    v24hUSD: number;
    v24hChangePercent: number;
    mc: number;
    mcChangePercent: number;
    liquidity: number;
    liquidityChangePercent: number;
    price: number;
    priceChangePercent: number;
}

interface BirdeyeResponse<T> {
    data: T;
    success: boolean;
    timestamp: number;
}

export class BirdeyeService {
    private apiKey: string;
    private baseUrl = "https://public-api.birdeye.so";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async getTrendingTokens(
        options: {
            sort_by?: "v24hUSD" | "mc" | "v24hChangePercent";
            sort_type?: "desc" | "asc";
            offset?: number;
            limit?: number;
            min_liquidity?: number;
        } = {}
    ): Promise<BirdeyeResponse<TrendingToken[]>> {
        try {
            const {
                sort_by = "v24hUSD",
                sort_type = "desc",
                offset = 0,
                limit = 100,
                min_liquidity = 1000,
            } = options;

            const params = new URLSearchParams({
                sort_by,
                sort_type,
                offset: offset.toString(),
                limit: limit.toString(),
                min_liquidity: min_liquidity.toString(),
            });

            const response = await fetch(
                `${this.baseUrl}/defi/token_trending?${params.toString()}`,
                {
                    headers: {
                        "X-API-KEY": this.apiKey,
                        "x-chain": "solana",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            elizaLogger.error("Error fetching trending tokens:", error);
            throw error;
        }
    }
}

export const birdeyeProvider: Provider = {
    get: async (runtime: IAgentRuntime, _message: Memory, _state: State) => {
        const apiKey = runtime.getSetting("BIRDEYE_API_KEY");
        if (!apiKey) {
            throw new Error("BIRDEYE_API_KEY not configured");
        }

        // Initialize service only when needed
        const birdeyeService = new BirdeyeService(apiKey);
        console.log("birdeyeService", birdeyeService);

        // We don't fetch data here - this provider just ensures the service is available
        // and returns information about available capabilities
        return JSON.stringify({
            capabilities: [
                "Get trending tokens",
                "Token price information",
                "Market data",
            ],
            status: "ready",
        });
    },
};
