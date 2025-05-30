import { Polar } from "@polar-sh/sdk";

export const api = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "sandbox", // Use this option if you're using the sandbox environment - else use 'production' or omit the parameter
});