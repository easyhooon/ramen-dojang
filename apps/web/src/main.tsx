import { QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, RouterProvider, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { TDSMobileProvider } from "@toss/tds-mobile";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import React from "react";
import ReactDOM from "react-dom/client";
import type { ComponentProps } from "react";
import { queryClient } from "./lib/queryClient";
import { AboutPage } from "./routes/about";
import { HomePage } from "./routes";
import { ShopDetailPage } from "./routes/shops.$shopId";
import { ShopsPage } from "./routes/shops.index";
import { VisitDetailPage } from "./routes/visits.$visitId";
import { NewVisitPage } from "./routes/visits.new";
import "./styles.css";

function RootLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">라멘 도장깨기</Link>
        <nav>
          <Link to="/shops">라멘집</Link>
          <Link to="/visits/new">방문 추가</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomePage });
const shopsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/shops", component: ShopsPage });
const shopDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: "/shops/$shopId", component: ShopDetailPage });
const newVisitRoute = createRoute({ getParentRoute: () => rootRoute, path: "/visits/new", component: NewVisitPage });
const visitDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: "/visits/$visitId", component: VisitDetailPage });
const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: "/about", component: AboutPage });

const routeTree = rootRoute.addChildren([indexRoute, shopsRoute, shopDetailRoute, newVisitRoute, visitDetailRoute, aboutRoute]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TDSProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </TDSProvider>
  </React.StrictMode>,
);

function TDSProvider({ children }: { children: React.ReactNode }) {
  const brandPrimaryColor = "#b45309";

  if ("ReactNativeWebView" in globalThis) {
    return <TDSMobileAITProvider brandPrimaryColor={brandPrimaryColor}>{children}</TDSMobileAITProvider>;
  }

  return (
    <TDSMobileProvider userAgent={webUserAgent} token={{ color: { primary: brandPrimaryColor } }}>
      {children}
    </TDSMobileProvider>
  );
}

const webUserAgent: ComponentProps<typeof TDSMobileProvider>["userAgent"] = {
  fontA11y: undefined,
  fontScale: undefined,
  isAndroid: false,
  isIOS: false,
};
