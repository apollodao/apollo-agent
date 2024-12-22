import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    elizaLogger,
} from "@ai16z/eliza";

export const getTrendingTokensAction: Action = {
    name: "GET_TRENDING_TOKENS",
    similes: [
        "FETCH_TRENDING_TOKENS",
        "SHOW_TRENDING_TOKENS",
        "LIST_TRENDING_TOKENS",
        "POPULAR_TOKENS",
        "TOP_VOLUME_TOKENS",
        "HIGHEST_VOLUME_TOKENS",
        "MARKET_CAP_TOKENS",
        "TOP_MARKET_CAP",
    ],
    description:
        "Fetch current trending tokens from Birdeye, sorted by volume, market cap, or price change",
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        // Check if Birdeye API key is configured
        return !!runtime.getSetting("BIRDEYE_API_KEY");
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        _state: State,
        options: any,
        callback?: HandlerCallback
    ): Promise<boolean> => {
        try {
            const apiKey = runtime.getSetting("BIRDEYE_API_KEY");
            if (!apiKey) {
                throw new Error("BIRDEYE_API_KEY not configured");
            }

            callback({
                text: "Here are the trending tokens:\n1. APOLLO (APL):\n   💰 $1.2345\n   📈 +5.67% 24h\n   📊 Vol: $1.23M\n   💧 Liq: $2.34M",
                content: [
                    {
                        name: "APOLLO",
                        symbol: "APL",
                        price: 1.2345,
                        change24h: 5.67,
                        volume24h: 1230000,
                        liquidity: 2340000,
                    },
                ],
            });

            return true;
        } catch (error) {
            console.log("error", error);
            elizaLogger.error("Error fetching trending tokens:", error);
            if (callback) {
                callback({
                    text: `Sorry, I encountered an error while fetching trending tokens: ${error.message}`,
                });
            }
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "What are the trending tokens right now?" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Let me check the trending tokens for you.",
                    action: "GET_TRENDING_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me the highest volume tokens on Solana",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "I'll fetch the tokens with highest trading volume.",
                    action: "GET_TRENDING_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "What are the top tokens by market cap?" },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "I'll show you the tokens with the highest market cap.",
                    action: "GET_TRENDING_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Which tokens have the biggest price changes today?",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "I'll check which tokens have the largest price movements in the last 24 hours.",
                    action: "GET_TRENDING_TOKENS",
                },
            },
        ],
    ],
};
