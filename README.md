# Cloudflare Simple Worker (Log Collection)

A simple Cloudflare Worker that captures HTTP request data and forwards it to a log collection API.

## Features

- Captures detailed request metadata (IP, country, city, user agent, etc.)
- Non-blocking log forwarding using `ctx.waitUntil()`
- Simple middleware pattern that doesn't interfere with request handling

## Log Format

Each log entry includes:

| Field | Description |
|-------|-------------|
| `EdgeStartTimestamp` | ISO timestamp when request was received |
| `ClientIP` | Client's IP address |
| `ClientCountry` | Client's country (from Cloudflare) |
| `ClientCity` | Client's city (from Cloudflare) |
| `ClientRequestScheme` | HTTP or HTTPS |
| `ClientRequestHost` | Request hostname |
| `ClientRequestURI` | Request path and query string |
| `ClientRequestMethod` | HTTP method (GET, POST, etc.) |
| `ClientRequestUserAgent` | Client's user agent string |
| `ClientRequestReferer` | Referer header |
| `EdgeResponseStatus` | HTTP response status code |
