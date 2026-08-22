import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string(),
    PORT: z.coerce.number().default(3000),
    JWT_SECRET_KEY: z.string(),
    ZOOM_ACCOUNT_ID: z.string(),
    ZOOM_CLIENT_ID: z.string(),
    ZOOM_CLIENT_SECRET: z.string()
})

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
    const result = envSchema.safeParse(process.env);
    if(!result.success) {
        console.error('Invalid enviroment variables');
        for (const issue of result.error.issues) {
            console.error(` ${issue.path.join('.')}: ${issue.message}`);
        }
        process.exit(1);
    }
    return result.data;
}

export const env = validateEnv();