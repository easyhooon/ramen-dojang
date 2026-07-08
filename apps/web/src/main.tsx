import { QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, RouterProvider, createRootRoute, createRoute, createRouter, useRouterState } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { Icon } from "./components/Icon";
import { queryClient } from "./lib/queryClient";
import { AboutPage } from "./routes/about";
import { HomePage } from "./routes";
import { PrivacyPage } from "./routes/privacy";
import { ShopDetailPage } from "./routes/shops.$shopId";
import { ShopsPage } from "./routes/shops.index";
import { TermsPage } from "./routes/terms";
import { VisitDetailPage } from "./routes/visits.$visitId";
import { NewVisitPage } from "./routes/visits.new";
import "./styles.css";

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isNewVisitPage = pathname === "/visits/new";
  const isMiniAppWebView = "ReactNativeWebView" in globalThis;

  return (
    <div className={["app-shell", isNewVisitPage ? "app-shell--focused" : "", isMiniAppWebView ? "app-shell--miniapp" : ""].filter(Boolean).join(" ")}>
      <header className="topbar">
        <Link className="brand" to="/">라멘 도장깨기</Link>
        <nav>
          <Link to="/shops">라멘집</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      {isNewVisitPage ? null : (
        <>
          <Link className="visit-fab" to="/visits/new" aria-label="방문 기록 추가">
            <Icon name="plus" />
          </Link>
          <nav className="bottom-nav" aria-label="주요 화면">
            <Link to="/"><Icon name="home" />홈</Link>
            <Link to="/shops"><Icon name="search" />탐색</Link>
            <Link to="/about"><Icon name="settings" />설정</Link>
          </nav>
        </>
      )}
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
const termsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/terms", component: TermsPage });
const privacyRoute = createRoute({ getParentRoute: () => rootRoute, path: "/privacy", component: PrivacyPage });

const routeTree = rootRoute.addChildren([indexRoute, shopsRoute, shopDetailRoute, newVisitRoute, visitDetailRoute, aboutRoute, termsRoute, privacyRoute]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
