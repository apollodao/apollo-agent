import {
    IAgentRuntime,
    Memory,
    Provider,
    State,
    elizaLogger,
} from "@elizaos/core";

interface TokenOverview {
    address: string;
    symbol: string;
    name: string;
    price: number;
    priceChange24h: number;
    volume24h: number;
    marketCap: number;
    fullyDilutedValuation: number;
    totalSupply: number;
    circulatingSupply: number;
}

const OVERVIEW_KEYWORDS = [
    "overview",
    "details",
    "info",
    "information",
    "about",
    "tell me about",
    "what is",
    "show me",
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

const BASE_URL = "https://public-api.birdeye.so";

const getTokenOverview = async (
    apiKey: string,
    contractAddress: string,
    chain: string = "solana"
): Promise<TokenOverview | null> => {
    try {
        const params = new URLSearchParams({
            address: contractAddress,
        });
        const url = `${BASE_URL}/defi/token_overview?${params.toString()}`;
        elizaLogger.info(
            `Fetching token overview for address ${contractAddress} on ${chain} from:`,
            url
        );

        const response = await fetch(url, {
            headers: {
                "X-API-KEY": apiKey,
                "x-chain": chain,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        elizaLogger.error("Error fetching token overview:", error);
        return null;
    }
};

const formatTokenOverview = (token: TokenOverview, chain: string): string => {
    return `Token Overview for ${token.name} (${token.symbol}) on ${chain.charAt(0).toUpperCase() + chain.slice(1)}:

• Price: $${token.price.toFixed(4)}
• 24h Change: ${token.priceChange24h.toFixed(2)}%
• 24h Volume: $${token.volume24h.toLocaleString()}
• Market Cap: $${token.marketCap.toLocaleString()}
• Fully Diluted Valuation: $${token.fullyDilutedValuation.toLocaleString()}
• Total Supply: ${token.totalSupply.toLocaleString()}
• Circulating Supply: ${token.circulatingSupply.toLocaleString()}
• Contract Address: ${token.address}`;
};

export const tokenOverviewProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, _state?: State) => {
        const apiKey = runtime.getSetting("BIRDEYE_API_KEY");
        if (!apiKey) {
            return null;
        }

        const messageText = message.content.text.toLowerCase();

        // Check if message contains overview related keywords
        const hasOverviewKeyword = OVERVIEW_KEYWORDS.some((keyword) =>
            messageText.includes(keyword.toLowerCase())
        );

        if (!hasOverviewKeyword) {
            return null;
        }

        // Extract contract address - looking for 0x... or other chain-specific formats
        const words = messageText.split(/\s+/);
        let contractAddress: string | null = null;

        // Look for contract address patterns
        for (const word of words) {
            // Ethereum-like addresses (0x...)
            if (/^0x[a-fA-F0-9]{40}$/.test(word)) {
                contractAddress = word;
                break;
            }
            // Solana addresses (base58, typically 32-44 chars)
            if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(word)) {
                contractAddress = word;
                break;
            }
        }

        if (!contractAddress) {
            return null;
        }

        // Determine which chain is being asked about
        const requestedChain =
            CHAIN_KEYWORDS.find((chain) =>
                messageText.includes(chain.toLowerCase())
            ) || "solana";

        elizaLogger.info(
            `Token overview provider activated for address ${contractAddress} on ${requestedChain}`
        );

        const tokenOverview = await getTokenOverview(
            apiKey,
            contractAddress,
            requestedChain
        );

        if (!tokenOverview) {
            return null;
        }

        return formatTokenOverview(tokenOverview, requestedChain);
    },
};
