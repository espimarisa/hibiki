type PrivateClientOptions = import("discord.js").ClientOptions;

type HibikiCoreOptions = {
  token: string;
};

interface HibikiConfig {
  hibiki: HibikiCoreOptions;
  options?: PrivateClientOptions | Record<string, never>;
}
