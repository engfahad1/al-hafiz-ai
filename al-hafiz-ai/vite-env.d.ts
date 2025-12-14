// This ensures TypeScript doesn't complain about process.env usage
// while avoiding conflicts with @types/node if present
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly API_KEY: string;
      [key: string]: string | undefined;
    }
  }
}

export {};