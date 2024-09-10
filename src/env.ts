import z from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
})

//verifica se está seguindo o formatado acima da verificação
export const env = envSchema.parse(process.env)