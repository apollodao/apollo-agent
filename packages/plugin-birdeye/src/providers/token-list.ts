import {
    IAgentRuntime,
    Memory,
    Provider,
    State,
    elizaLogger,
} from "@elizaos/core";

interface TokenListItem {
    address: string;
    chainId: number;
    decimals: number;
    logoURI: string;
    name: string;
    symbol: string;
    tags: string[];
    verified: boolean;
}

const TOKEN_LIST_KEYWORDS = [
    "list",
    "all",
    "tokens",
    "available",
    "supported",
    "show",
    "find",
    "search",
];

const CHAIN_KEYWORDS = [
    "solana",
    "ethereum",
    "arbitrum",
    "avalanche",
    "bsc",
    "optimism",
    "polygon",
    "base",
    "zksync",
    "sui",
];

const PAGINATION_KEYWORDS = [
    "more",
    "additional",
    "next",
    "other",
    "show more",
    "continue",
];

const BASE_URL = "https://public-api.birdeye.so";

interface GetTokenListOptions {
    offset?: number;
    limit?: number;
    chain?: string;
}

const getTokenList = async (
    apiKey: string,
    options: GetTokenListOptions = {}
): Promise<TokenListItem[]> => {
    try {
        const { offset = 0, limit = 10, chain = "solana" } = options;

        const params = new URLSearchParams({
            offset: offset.toString(),
            limit: limit.toString(),
        });

        const url = `${BASE_URL}/defi/tokenlist?${params.toString()}`;
        elizaLogger.info("Fetching token list from:", url);

        const response = await fetch(url, {
            headers: {
                "X-API-KEY": apiKey,
                "x-chain": chain,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return (await response.json()).data.tokens;
    } catch (error) {
        elizaLogger.error("Error fetching token list:", error);
        throw error;
    }
};

const formatTokenListToString = (
    tokens: TokenListItem[],
    chain: string
): string => {
    if (!tokens.length) {
        return "No tokens found.";
    }

    const formattedTokens = tokens
        .map((token, index) => {
            return (
                `${index + 1}. ${token.name} (${token.symbol}):\n` +
                `   Address: ${token.address}\n` +
                `   Decimals: ${token.decimals}\n` +
                `   Verified: ${token.verified ? "Yes" : "No"}` +
                (token.tags?.length
                    ? `\n   Tags: ${token.tags.join(", ")}`
                    : "")
            );
        })
        .join("\n\n");

    return `Here are the tokens on ${chain.charAt(0).toUpperCase() + chain.slice(1)}:\n\n${formattedTokens}`;
};

export const tokenListProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
        const apiKey = runtime.getSetting("BIRDEYE_API_KEY");
        if (!apiKey) {
            return null;
        }

        const messageText = message.content.text.toLowerCase();

        // Check if message contains token list related keywords
        const hasTokenListKeyword = TOKEN_LIST_KEYWORDS.some((keyword) =>
            messageText.includes(keyword)
        );

        // Check if the message is a direct question about token list
        const isQuestionAboutTokens =
            messageText.includes("?") &&
            (messageText.includes("what") ||
                messageText.includes("which") ||
                messageText.includes("show")) &&
            hasTokenListKeyword;

        // Check recent conversation context from state
        const recentMessages = (state?.recentMessagesData || []) as Memory[];
        const isInTokenListConversation = recentMessages.some(
            (msg) =>
                msg.content?.text?.toLowerCase().includes("token") ||
                msg.content?.text?.toLowerCase().includes("list")
        );

        // Determine if this is a pagination request
        const isPaginationRequest = PAGINATION_KEYWORDS.some((keyword) =>
            messageText.includes(keyword)
        );

        // Get the current offset from state or default to 0
        const currentOffset = (state?.tokenListOffset as number) || 0;
        const offset = isPaginationRequest ? currentOffset + 10 : 0;

        // Determine which chain is being asked about
        const requestedChain =
            CHAIN_KEYWORDS.find((chain) =>
                messageText.includes(chain.toLowerCase())
            ) || "solana";

        // Combine signals to make decision
        const shouldProvideData =
            // Direct questions about token list
            isQuestionAboutTokens ||
            // Explicit mentions of token list
            hasTokenListKeyword ||
            // Follow-up in a token list conversation
            isInTokenListConversation ||
            // Pagination request in conversation context
            (isPaginationRequest && isInTokenListConversation);

        if (!shouldProvideData) {
            return null;
        }

        elizaLogger.info(
            `Token list provider activated for ${requestedChain} token list query`
        );

        const tokenList = await getTokenList(apiKey, {
            offset,
            limit: 10,
            chain: requestedChain,
        });

        const formattedTokenList = formatTokenListToString(
            tokenList,
            requestedChain
        );

        return formattedTokenList;
    },
};
