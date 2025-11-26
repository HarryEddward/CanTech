// src/lib/stripe/client.ts
"use client";

import { loadStripe } from "@stripe/stripe-js";

console.log("Public Key:", process.env.NEXT_PUBLIC_STRIPE_KEY);
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_KEY!
);
