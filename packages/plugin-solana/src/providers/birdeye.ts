import { IAgentRuntime, Memory, Provider, State } from "@ai16z/eliza";
import { Connection, PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import NodeCache from "node-cache";
import { getWalletKey } from "../keypairUtils";

// Provider configuration
const PROVIDER_CONFIG = {
    BIRDEYE_API: "https://public-api.birdeye.so",
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    DEFAULT_RPC: "https://api.mainnet-beta.solana.com",
    GRAPHQL_ENDPOINT: "https://graph.codex.io/graphql",
    TOKEN_ADDRESSES: {
        SOL: "So11111111111111111111111111111111111111112",
        BTC: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
        ETH: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    },
};

export interface Item {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    balance: string;
    uiAmount: string;
    priceUsd: string;
    valueUsd: string;
    valueSol?: string;
}

interface WalletPortfolio {
    totalUsd: string;
    totalSol?: string;
    items: Array<Item>;
}

interface _BirdEyePriceData {
    data: {
        [key: string]: {
            price: number;
            priceChange24h: number;
        };
    };
}

export class BirdeyeProvider {
    private cache: NodeCache;

    constructor(
        private connection: Connection,
        private walletPublicKey: PublicKey
    ) {
        this.cache = new NodeCache({ stdTTL: 300 }); // Cache TTL set to 5 minutes
    }

    private async fetchWithRetry(
        runtime,
        url: string,
        options: RequestInit = {}
    ): Promise<any> {
        let lastError: Error;

        for (let i = 0; i < PROVIDER_CONFIG.MAX_RETRIES; i++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        Accept: "application/json",
                        "x-chain": "solana",
                        "X-API-KEY":
                            runtime.getSetting("BIRDEYE_API_KEY", "") || "",
                        ...options.headers,
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(
                        `HTTP error! status: ${response.status}, message: ${errorText}`
                    );
                }

                const data = await response.json();
                return data;
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                lastError = error;
                if (i < PROVIDER_CONFIG.MAX_RETRIES - 1) {
                    const delay = PROVIDER_CONFIG.RETRY_DELAY * Math.pow(2, i);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }
            }
        }

        console.error(
            "All attempts failed. Throwing the last error:",
            lastError
        );
        throw lastError;
    }

    async fetchPortfolioValue(runtime): Promise<WalletPortfolio> {
        try {
            const cacheKey = `portfolio-${this.walletPublicKey.toBase58()}`;
            const cachedValue = this.cache.get<WalletPortfolio>(cacheKey);

            if (cachedValue) {
                console.log("Cache hit for fetchPortfolioValue");
                return cachedValue;
            }
            console.log("Cache miss for fetchPortfolioValue");

            const walletData = await this.fetchWithRetry(
                runtime,
                `${PROVIDER_CONFIG.BIRDEYE_API}/v1/wallet/token_list?wallet=${this.walletPublicKey.toBase58()}`
            );

            if (!walletData?.success || !walletData?.data) {
                console.error("No portfolio data available", walletData);
                throw new Error("No portfolio data available");
            }

            const data = walletData.data;
            const totalUsd = new BigNumber(data.totalUsd.toString());
            const prices = await this.fetchPrices(runtime);
            const solPriceInUSD = new BigNumber(prices.solana.usd.toString());

            const items = data.items.map((item: any) => ({
                ...item,
                valueSol: new BigNumber(item.valueUsd || 0)
                    .div(solPriceInUSD)
                    .toFixed(6),
                name: item.name || "Unknown",
                symbol: item.symbol || "Unknown",
                priceUsd: item.priceUsd || "0",
                valueUsd: item.valueUsd || "0",
            }));

            const totalSol = totalUsd.div(solPriceInUSD);
            const portfolio = {
                totalUsd: totalUsd.toString(),
                totalSol: totalSol.toFixed(6),
                items: items.sort((a, b) =>
                    new BigNumber(b.valueUsd)
                        .minus(new BigNumber(a.valueUsd))
                        .toNumber()
                ),
            };
            this.cache.set(cacheKey, portfolio);
            return portfolio;
        } catch (error) {
            console.error("Error fetching portfolio:", error);
            throw error;
        }
    }

    async fetchTokenList(runtime): Promise<
        Array<{
            address: string;
            symbol: string;
            name: string;
            decimals: number;
            logoURI?: string;
            tags?: string[];
        }>
    > {
        try {
            const cacheKey = "token-list";
            const cachedValue = this.cache.get<Array<any>>(cacheKey);

            if (cachedValue) {
                console.log("Cache hit for fetchTokenList");
                return cachedValue;
            }
            console.log("Cache miss for fetchTokenList");

            const response = await this.fetchWithRetry(
                runtime,
                `${PROVIDER_CONFIG.BIRDEYE_API}/defi/tokenlist`
            );

            if (!response?.success || !response?.data) {
                console.error("No token list data available", response);
                throw new Error("No token list data available");
            }

            console.log("response", JSON.stringify(response, null, 2));

            const tokenList = response.data.tokens.map((token: any) => ({
                address: token.address || "",
                symbol: token.symbol || "Unknown",
                name: token.name || "Unknown Token",
                decimals: token.decimals || 0,
                logoURI: token.logoURI,
                tags: token.tags,
            }));

            this.cache.set(cacheKey, tokenList);
            return tokenList;
        } catch (error) {
            console.error("Error fetching token list:", error);
            throw error;
        }
    }

    formatTokenList(
        runtime,
        tokens: Array<{
            address: string;
            symbol: string;
            name: string;
            decimals: number;
            logoURI?: string;
            tags?: string[];
        }>
    ): string {
        let output = `${runtime.character.description}\n\n`;
        output += `Available Tokens:\n\n`;

        if (tokens.length === 0) {
            output += "No tokens found\n";
            return output;
        }

        for (const token of tokens) {
            output += `Name: ${token.name}\n`;
            output += `Symbol: ${token.symbol}\n`;
            output += `Address: ${token.address}\n`;
            output += `Decimals: ${token.decimals}\n`;
            if (token.tags && token.tags.length > 0) {
                output += `Tags: ${token.tags.join(", ")}\n`;
            }
            output += "\n";
        }

        output += `Total Tokens Listed: ${tokens.length}\n`;
        return output;
    }

    async getFormattedTokenList(runtime): Promise<string> {
        try {
            const tokens = await this.fetchTokenList(runtime);
            console.log("tokens", JSON.stringify(tokens, null, 2));
            return this.formatTokenList(runtime, tokens);
        } catch (error) {
            console.error("Error generating token list:", error);
            return "Unable to fetch token list. Please try again later.";
        }
    }
}

const birdeyeProvider: Provider = {
    get: async (
        runtime: IAgentRuntime,
        _message: Memory,
        _state?: State
    ): Promise<string | null> => {
        try {
            const { publicKey } = await getWalletKey(runtime, false);

            const connection = new Connection(
                runtime.getSetting("RPC_URL") || PROVIDER_CONFIG.DEFAULT_RPC
            );

            const provider = new BirdeyeProvider(connection, publicKey);

            return await provider.getFormattedTokenList(runtime);
        } catch (error) {
            console.error("Error in birdeye provider:", error);
            return null;
        }
    },
};

// Module exports
export { birdeyeProvider };
