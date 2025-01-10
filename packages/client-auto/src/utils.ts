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
