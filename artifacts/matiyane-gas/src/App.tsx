import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import ProductsPage from "@/pages/products";
import OrderPage from "@/pages/order";
import ContactPage from "@/pages/contact";
import OrderSuccessPage from "@/pages/order-success";
import AdminPage from "@/pages/admin";
import { NotificationBar } from "@/components/layout/NotificationBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NotificationBar />
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Layout><HomePage /></Layout>} />
      <Route path="/about" component={() => <Layout><AboutPage /></Layout>} />
      <Route path="/products" component={() => <Layout><ProductsPage /></Layout>} />
      <Route path="/order" component={() => <Layout><OrderPage /></Layout>} />
      <Route path="/contact" component={() => <Layout><ContactPage /></Layout>} />
      <Route path="/order-success" component={() => <Layout><OrderSuccessPage /></Layout>} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
