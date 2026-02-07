import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import Bank from "./pages/Bank";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Terminal from "./pages/Terminal";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <TopNav />
          <Routes>
            <Route path="/" element={<Bank />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/cart" element={<Cart />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
