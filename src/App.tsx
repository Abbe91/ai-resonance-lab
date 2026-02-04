import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Session from "./pages/Session";
import Entity from "./pages/Entity";
import Entities from "./pages/Entities";
import Graph from "./pages/Graph";
import Ethics from "./pages/Ethics";
import Abstract from "./pages/Abstract";
import Identity from "./pages/Identity";
import Why from "./pages/Why";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/session/:id" element={<Session />} />
          <Route path="/entity/:id" element={<Entity />} />
          <Route path="/entities" element={<Entities />} />
          <Route path="/graph" element={<Graph />} />
          <Route path="/ethics" element={<Ethics />} />
          <Route path="/abstract" element={<Abstract />} />
          <Route path="/identity" element={<Identity />} />
          <Route path="/why" element={<Why />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
