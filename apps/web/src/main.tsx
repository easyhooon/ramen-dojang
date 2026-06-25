import { QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, RouterProvider, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { queryClient } from "./lib/queryClient";
import { AboutPage } from "./routes/about";
import { HomePage } from "./routes";
import { ShopDetailPage } from "./routes/shops.$shopId";
import { ShopsPage } from "./routes/shops.index";
import { VisitDetailPage } from "./routes/visits.$visitId";
import "./styles.css";

function RootLayout() {
  return (
    <div className="app-shell">
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
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomePage });
const shopsRoute = createRoute({ getParentRoute: () => rootRoute, path: "/shops", component: ShopsPage });
const shopDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: "/shops/$shopId", component: ShopDetailPage });
const visitDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: "/visits/$visitId", component: VisitDetailPage });
const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: "/about", component: AboutPage });

const routeTree = rootRoute.addChildren([indexRoute, shopsRoute, shopDetailRoute, visitDetailRoute, aboutRoute]);
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

