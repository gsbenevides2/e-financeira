import type { App } from "../../server";

import { treaty } from "@elysiajs/eden";

export const apiClient = treaty<App>(typeof window !== "undefined" ? window.location.origin : "");
