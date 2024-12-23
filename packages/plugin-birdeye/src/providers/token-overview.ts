import {
    IAgentRuntime,
    Memory,
    Provider,
    State,
    elizaLogger,
} from "@elizaos/core";

interface TokenOverview {
    // Basic token info
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI: string;

    // Price and market data
    price: number;
    priceChange24hPercent: number;
    liquidity: number;
    marketCap: number;
    realMc: number;

    // Supply info
    supply: number;
    circulatingSupply: number;
    holder: number;

    // Volume data
    v24h: number;
    v24hUSD: number;

    // Social/metadata
    extensions?: {
        website?: string;
        twitter?: string;
        telegram?: string;
        discord?: string;
        description?: string;
        coingeckoId?: string;
    };

    // Trading info
    lastTradeUnixTime: number;
    numberMarkets: number;
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
    const formatNumber = (num: number) =>
        num
            ? num.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : "N/A";

    const socialLinks = token.extensions
        ? Object.entries(token.extensions)
              .filter(([key, value]) => {
                  try {
                      return Boolean(
                          value &&
                              typeof value === "string" &&
                              [
                                  "website",
                                  "twitter",
                                  "telegram",
                                  "discord",
                              ].includes(key)
                      );
                  } catch (err) {
                      elizaLogger.warn(
                          `Error processing social link for key ${key}:`,
                          err
                      );
                      return false;
                  }
              })
              .map(([key, value]) => {
                  try {
                      return `• ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
                  } catch (err) {
                      elizaLogger.error(
                          `Error formatting social link for ${key}:`,
                          err
                      );
                      return "";
                  }
              })
              .filter(Boolean)
              .join("\n")
        : "";

    const lastTradeTime = new Date(
        token.lastTradeUnixTime * 1000
    ).toLocaleString();

    return `Token Overview for ${token.name} (${token.symbol}) on ${chain.charAt(0).toUpperCase() + chain.slice(1)}

📊 Market Data
• Current Price: $${formatNumber(token.price)}
• 24h Change: ${formatNumber(token.priceChange24hPercent)}%
• Market Cap: $${formatNumber(token.marketCap)}
• Real Market Cap: $${formatNumber(token.realMc)}
• Liquidity: $${formatNumber(token.liquidity)}

📈 Trading Info
• 24h Volume: $${formatNumber(token.v24hUSD)}
• Number of Markets: ${token.numberMarkets}
• Last Trade: ${lastTradeTime}

💰 Supply Information
• Total Supply: ${formatNumber(token.supply)}
• Circulating Supply: ${formatNumber(token.circulatingSupply)}
• Number of Holders: ${token.holder.toLocaleString()}

🔗 Token Details
• Contract: ${token.address}
• Decimals: ${token.decimals}
${token.extensions?.description ? `• Description: ${token.extensions.description}\n` : ""}
${socialLinks ? `\n🌐 Social Links\n${socialLinks}` : ""}`;
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
        const words = message.content.text.split(/\s+/);
        let contractAddress: string | null = null;

        // Look for contract address patterns
        for (const word of words) {
            // Ethereum-like addresses (0x...)
            if (/^0x[a-fA-F0-9]{40}$/i.test(word)) {
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
            `TOKEN OVERVIEW provider activated for address ${contractAddress} on ${requestedChain}`
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
