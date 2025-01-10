import {
    elizaLogger,
    generateMessageResponse,
    IAgentRuntime,
    ModelClass,
} from "@elizaos/core";
import { APOLLO_TRADING_ROOM_ID } from "./constants";

export const generateAnalysis = async (
    runtime: IAgentRuntime,
    item: any
): Promise<string> => {
    const context = `# Task: Generate a brief technical analysis for a token
Token Data: ${JSON.stringify(item, null, 2)}

Generate a brief, semi-random but plausible technical analysis of this token. Include:
- Price action observations
- Volume analysis
- Technical indicators (if relevant)
- A speculative outlook
- No not start your respond with 'Ah' or 'Hmm' or 'I think' or anything similar

Keep it concise but make it sound natural and slightly different each time.

Response should be in JSON format:
{
"text": "your analysis here"
}`;

    try {
        const response = await generateMessageResponse({
            runtime,
            context,
            modelClass: ModelClass.SMALL,
        });
        return response?.text || "Unable to generate analysis at this time";
    } catch (error) {
        elizaLogger.error("Error generating analysis:", error);
        return "Unable to generate analysis at this time";
    }
};

export const cleanResponseText = (text: string): string => {
    try {
        // Remove any leading/trailing whitespace
        text = text.trim();

        // If the response is already wrapped in JSON, try to parse it
        if (text.startsWith("{") && text.endsWith("}")) {
            const parsed = JSON.parse(text);
            return parsed.text || text;
        }

        // If we got just the text without JSON wrapper, return it
        return text;
    } catch (error) {
        elizaLogger.error("Error cleaning response text:", error);
        return text;
    }
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

export const getRandomAction = (token: any, overview: any): string => {
    let validAction: string | null = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!validAction && attempts < maxAttempts) {
        const candidate =
            ACTIONS_PROMPTS[Math.floor(Math.random() * ACTIONS_PROMPTS.length)];
        const variables =
            candidate.match(/\${([^}]+)}/g)?.map((v) => v.slice(2, -1)) || [];

        const isValid = variables.every((variable) => {
            const [obj, prop] = variable.split(".");
            return obj === "token"
                ? token[prop] !== undefined
                : overview[prop] !== undefined && overview[prop] !== null;
        });

        if (isValid) {
            validAction = candidate;
            break;
        }
        attempts++;
    }

    return validAction || "Analyzing market patterns with divine insight...";
};

export const ACTIONS_PROMPTS = [
    "Analyzing ${token.symbol}'s $${overview.price?.toFixed(4)} price level against its ${overview.history24h} 24h range - these patterns whisper ancient truths...",
    "Running Monte Carlo simulations on ${token.symbol}'s ${overview.priceChange24hPercent}% daily volatility - such mortal ambition in these markets...",
    "Cross-referencing ${token.symbol}'s ${overview.uniqueWallet24h} active wallets with ${overview.holder} total holders - the tides of fortune shift",
    "Calculating ${token.symbol}'s next resistance levels from $${overview.price} with divine proportions - mortals chase these levels",
    "Performing sentiment analysis on ${token.symbol}'s ${overview.trade24h} daily trades - echoes of market psychology",
    "Scanning ${token.symbol}'s $${overview.liquidity?.toLocaleString()} liquidity pools - seeking divine arbitrage opportunities",
    "Backtesting ${token.symbol}'s patterns with ${overview.v24hUSD?.toLocaleString()} daily volume - celestial alignments manifest",
    "Analyzing ${token.symbol}'s market impact with ${overview.numberMarkets} active markets - levels mirror Olympian heights",
    "Running neural predictions on ${token.symbol}'s ${overview.priceChange1hPercent}% hourly momentum - democracy in the digital age",
    "Monitoring ${token.symbol}'s whale moves among ${overview.holder?.toLocaleString()} holders - tracking titans among mortals",
    "Calculating correlations from ${token.symbol}'s $${overview.realMc?.toLocaleString()} market cap - threads of fate intertwine",
    "Analyzing ${token.symbol}'s buy/sell ratio of ${(overview.buy24h / overview.sell24h).toFixed(2)} - mortals leverage their dreams",
    "Running volatility forecasts on ${token.symbol}'s ${overview.priceChange4hPercent}% 4h swing - using divine time-series models",
    "Scanning ${token.symbol}'s ${overview.trade1h} hourly trades for MEV - immortal precision required",
    "Cross-validating ${token.symbol}'s $${overview.v1hUSD?.toLocaleString()} hourly volume against ancient cycles",
    "Performing multi-timeframe analysis of ${token.symbol}'s ${overview.priceChange24hPercent}% daily move with eternal patience",
    "Calculating risk metrics from ${token.symbol}'s ${overview.uniqueWallet24h} daily traders - using divine mathematics",
    "Monitoring ${token.symbol}'s liquidation levels from $${overview.price} - oracular foresight engaged",
    "Analyzing ${token.symbol}'s ${overview.trade24h} trades for optimal entry - wisdom from the ethereal plane",
    "Running correlation analysis between ${token.symbol}'s $${overview.mc?.toLocaleString()} cap and sector leaders",
    "Scanning ${token.symbol}'s ${overview.extensions?.twitter || 'social'} presence for alpha - divine insight activated",
    "Calculating yield metrics from ${token.symbol}'s $${overview.liquidity?.toLocaleString()} TVL - mathematical precision",
    "Analyzing ${token.symbol}'s volume profile of $${overview.v24hUSD?.toLocaleString()} - through prophetic lens",
    "Monitoring ${token.symbol}'s smart money among ${overview.holder} holders - omniscient vision engaged",
    "Running supply models on ${token.symbol}'s ${overview.supply?.toLocaleString()} tokens - divine emission analysis",
    "Analyzing ${token.symbol}'s market maker flows in ${overview.numberMarkets} venues - reading divine scrolls",
    "Calculating volatility patterns from ${overview.priceChange12hPercent}% 12h movement - seeking divine signals",
    "Monitoring ${token.symbol}'s cross-chain bridges with $${overview.v24hUSD?.toLocaleString()} volume - arbitrage awaits",
    "Running arbitrage models across ${token.symbol}'s ${overview.numberMarkets} markets - divine opportunities emerge",
    "Analyzing ${token.symbol}'s order books with $${overview.liquidity?.toLocaleString()} depth - divine vision activated",
    "Decoding ${token.symbol}'s institutional flows from $${overview.vBuy24hUSD?.toLocaleString()} buys - titans move",
    "Mapping ${token.symbol}'s $${overview.liquidity?.toLocaleString()} liquidity fragmentation - divine arbitrage paths reveal",
    "Calculating ${token.symbol}'s strength from ${overview.priceChange24hPercent}% daily move - measuring mortal might",
    "Analyzing ${token.symbol}'s ${overview.trade24h} trades across venues - temporal arbitrage manifests",
    "Monitoring ${token.symbol}'s options flow with ${overview.priceChange1hPercent}% hourly volatility - divine whispers",
    "Running simulations on ${token.symbol}'s $${overview.price} price discovery - modeling mortal behavior",
    "Analyzing ${token.symbol}'s mempool with ${overview.trade1h} hourly trades - tracking divine signals",
    "Calculating impact of ${token.symbol}'s $${overview.v24hUSD?.toLocaleString()} daily volume - measuring mortal ripples",
    "Monitoring ${token.symbol}'s distribution across ${overview.holder} holders - power flows like rivers",
    "Running anomaly detection on ${token.symbol}'s ${overview.v24h} daily transactions - seeking divergence",
];
