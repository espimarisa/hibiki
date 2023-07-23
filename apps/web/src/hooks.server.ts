import type { Handle } from "@sveltejs/kit";
import { createTRPCHandle } from "trpc-sveltekit";
import { createContext } from "$lib/trpc/context";
import { router } from "$lib/trpc/router";

export const handle: Handle = createTRPCHandle({ router, createContext });
