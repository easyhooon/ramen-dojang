import { createRamenApiClient } from "@ramen-dojang/api-client";

export const api = createRamenApiClient(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080");

