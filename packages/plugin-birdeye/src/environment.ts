import { IAgentRuntime } from "@ai16z/eliza";
import { z } from "zod";

export const birdeyeEnvSchema = z
    .object({
        BIRDEYE_API_KEY: z.string().min(1, "Birdeye API key is required"),
    })
    .and(
        z.union([
            z.object({
                WALLET_SECRET_KEY: z
                    .string()
                    .min(1, "Wallet secret key is required"),
                WALLET_PUBLIC_KEY: z
                    .string()
                    .min(1, "Wallet public key is required"),
            }),
            z.object({
                WALLET_SECRET_SALT: z
                    .string()
                    .min(1, "Wallet secret salt is required"),
            }),
        ])
    );

export type BirdeyeConfig = z.infer<typeof birdeyeEnvSchema>;

export async function validateBirdeyeConfig(
    runtime: IAgentRuntime
): Promise<BirdeyeConfig> {
    try {
        const config = {
            BIRDEYE_API_KEY:
                runtime.getSetting("BIRDEYE_API_KEY") ||
                process.env.BIRDEYE_API_KEY,
        };

        return birdeyeEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Solana configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
