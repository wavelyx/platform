import { z } from 'zod';

const envSchema = z.object({
    // make arweave object env that will take an object and the object are strings
    ARWEAVE: z.object({
        value: z.string()
    }),

});

export const Env = envSchema.parse(process.env);