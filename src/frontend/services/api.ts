import { treaty } from "@elysiajs/eden";
import type { App } from "../../server";

export const apiClient = treaty<App>(
	typeof window !== "undefined" ? window.location.origin : "",
);
