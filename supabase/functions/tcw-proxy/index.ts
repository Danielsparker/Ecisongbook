// Supabase Edge Function: tcw-proxy
// Proxies requests to Tamil Christian World public API with rate limiting and CORS enforcement

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TCW_BASE_URL = "https://tamilchristianworld.com/api/v1";

// In-memory token bucket rate limiter (per client IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60; // 60 requests per minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

serve(async (req: Request) => {
  const origin = req.headers.get("Origin") || "*";

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
  if (!checkRateLimit(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please wait before making more requests." }),
      {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const url = new URL(req.url);
    // Parse target path and query
    // e.g. /tcw-proxy?path=songs&q=jesus or /tcw-proxy?path=songs/yesu-magaaraajaa-yesu
    const targetPath = url.searchParams.get("path") || "songs";
    url.searchParams.delete("path");
    
    // Construct upstream TCW URL
    const queryString = url.searchParams.toString();
    const upstreamUrl = `${TCW_BASE_URL}/${targetPath}${queryString ? `?${queryString}` : ""}`;

    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "ECISongbook-Proxy/1.0",
      },
    });

    const body = await upstreamResponse.text();
    return new Response(body, {
      status: upstreamResponse.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Failed to communicate with Tamil Christian World API", details: err.message }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
