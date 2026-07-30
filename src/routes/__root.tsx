import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { bsc, base } from "viem/chains";


import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head suppressHydrationWarning>
        <HeadContent />
        {/* Page loader styles — inlined so they're available before any CSS bundle */}
        <style dangerouslySetInnerHTML={{ __html: `
          #asterdex-loader {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0d0d0d;
            transition: opacity 0.4s ease, visibility 0.4s ease;
          }
          #asterdex-loader.light {
            background: #f5f5f0;
          }
          #asterdex-loader.loaded {
            opacity: 0;
            visibility: hidden;
          }
          .al-logo-wrap {
            position: relative;
            width: 72px;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .al-logo-img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: contain;
            animation: al-spin 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            filter: drop-shadow(0 0 10px rgba(240,185,11,0.55));
          }
          .al-label {
            margin-top: 20px;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.12em;
            color: rgba(255,255,255,0.35);
            font-family: system-ui, -apple-system, sans-serif;
            text-transform: uppercase;
          }
          #asterdex-loader.light .al-label {
            color: rgba(0,0,0,0.35);
          }
          @keyframes al-spin {
            0%   { transform: rotate(0deg) scale(1); }
            25%  { transform: rotate(90deg) scale(1.06); }
            50%  { transform: rotate(180deg) scale(1); }
            75%  { transform: rotate(270deg) scale(1.06); }
            100% { transform: rotate(360deg) scale(1); }
          }
        ` }} />
      </head>
      <body>
        {/* Page loader — visible immediately, removed by RootComponent on mount */}
        <div id="asterdex-loader" aria-hidden="true" suppressHydrationWarning>
          <div className="al-logo-wrap">
            <img
              src="https://ndgywsfyfxrixhkfrtia.supabase.co/storage/v1/object/public/My%20logod/IMG_8707.png"
              alt="AsterDex"
              className="al-logo-img"
            />
          </div>
        </div>
        {/* Runs synchronously right after the loader div exists — before any paint */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var saved = localStorage.getItem('asterdex-theme');
              var isLight = saved === 'light' ||
                (!saved && !window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (isLight) document.getElementById('asterdex-loader').classList.add('light');
            } catch(e){}
          })();
        ` }} />

        {children}
        <Scripts />
      </body>
    </html>
  );
}

function useIsDark() {
  // Always start as dark on the server (avoids SSR/hydration mismatch).
  // A useEffect syncs to the real DOM class on the client after mount.
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const el = document.documentElement;
    // Sync immediately to the actual theme on first client render
    setIsDark(el.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(el.classList.contains("dark"));
    });
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const isDark = useIsDark();

  useEffect(() => {
    const loader = document.getElementById("asterdex-loader");
    if (!loader) return;
    // Small delay so the first frame of the actual UI paints before we fade out
    const t = setTimeout(() => {
      loader.classList.add("loaded");
      loader.addEventListener("transitionend", () => loader.remove(), { once: true });
    }, 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <PrivyProvider
      appId="cms0pzb0200dw0bldfjr80r0g"
      config={{
        loginMethods: [
          "email",
          "sms",
          "wallet",
          "google",
          "twitter",
          "discord",
          "github",
          "linkedin",
          "spotify",
          "instagram",
          "tiktok",
          "apple",
          "farcaster",
        ],
        appearance: {
          // Match the app's trade-card surface: #0f0f0f in dark, #ffffff in light
          theme: isDark ? "#0f0f0f" : "#ffffff",
          accentColor: "#f0b90b",
        },
        defaultChain: bsc,
        supportedChains: [bsc, base],
        solanaClusters: [
          {
            name: "mainnet-beta",
            rpcUrl: "https://api.mainnet-beta.solana.com",
          },
        ],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </QueryClientProvider>
    </PrivyProvider>
  );
}
