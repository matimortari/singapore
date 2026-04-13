import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  modules: ["@nuxt/fonts", "@nuxt/icon", "@nuxtjs/color-mode", "@nuxtjs/seo", "@pinia/nuxt", "nuxt-auth-utils"],
  runtimeConfig: {
    dockerSocketPath: process.env.NUXT_DOCKER_SOCKET_PATH,
    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL,
    },
    session: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      password: process.env.NUXT_SESSION_PASSWORD!,
      cookie: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" },
    },
  },
  routeRules: {
    "/**": {
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      },
    },
  },
  devServer: { host: "0.0.0.0" },
  vite: {
    server: process.env.NUXT_PUBLIC_BASE_URL
      ? {
          allowedHosts: [new URL(process.env.NUXT_PUBLIC_BASE_URL).hostname],
          hmr: { protocol: "wss", host: new URL(process.env.NUXT_PUBLIC_BASE_URL).hostname, port: Number(new URL(process.env.NUXT_PUBLIC_BASE_URL).port) || 3000 },
        }
      : {},
    plugins: [tailwindcss() as any],
  },
  css: ["~/assets/styles.css"],
  colorMode: {
    classSuffix: "",
    preference: "system",
    fallback: "light",
    storageKey: "nuxt-color-mode",
  },
  icon: { mode: "svg", clientBundle: { scan: true } },
  ogImage: { enabled: false },
  robots: { disallow: ["/admin"] },
  site: { url: process.env.NUXT_PUBLIC_BASE_URL, name: "Singapore" },
})
