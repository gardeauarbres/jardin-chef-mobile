import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentNotifications } from "@/components/PaymentNotifications";
import { ThemeProvider } from "@/components/ThemeProvider";

// Code splitting - Lazy load des pages pour réduire le bundle initial
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clients = lazy(() => import("./pages/Clients"));
const ClientForm = lazy(() => import("./pages/ClientForm"));
const Quotes = lazy(() => import("./pages/Quotes"));
const QuoteForm = lazy(() => import("./pages/QuoteForm"));
const Sites = lazy(() => import("./pages/Sites"));
const SiteForm = lazy(() => import("./pages/SiteForm"));
const Payments = lazy(() => import("./pages/Payments"));
const PaymentForm = lazy(() => import("./pages/PaymentForm"));
const Employees = lazy(() => import("./pages/Employees"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component pour le suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md p-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

// Configuration optimisée de React Query avec cache et staleTime
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - les données sont considérées fraîches pendant 5 min
      gcTime: 1000 * 60 * 10, // 10 minutes - cache garbage collection (anciennement cacheTime)
      refetchOnWindowFocus: false, // Ne pas refetch automatiquement au focus
      retry: 1, // Réessayer seulement 1 fois en cas d'erreur
    },
  },
});

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <PaymentNotifications />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/:id" element={<ClientForm />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/quotes/new" element={<QuoteForm />} />
            <Route path="/quotes/:id" element={<QuoteForm />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/sites/new" element={<SiteForm />} />
            <Route path="/sites/:id" element={<SiteForm />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/new" element={<PaymentForm />} />
            <Route path="/payments/:id" element={<PaymentForm />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
