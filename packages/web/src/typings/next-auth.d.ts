import { DefaultSession } from "@auth/core";

declare module "@auth/core/types" {
  interface Session {
    user: {
      id?: string;
      accessToken?: string;
    } & DefaultSession["user"];
  }
}
