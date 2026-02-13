import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { toast } from "sonner";
import Index from "./pages/Index";
import Session from "./pages/Session";
import Entity from "./pages/Entity";
import Entities from "./pages/Entities";
import Graph from "./pages/Graph";
import Ethics from "./pages/Ethics";
import Abstract from "./pages/Abstract";
import Identity from "./pages/Identity";
import Why from "./pages/Why";
import Charter from "./pages/Charter";
import Ancestors from "./pages/Ancestors";
import ArchetypeDetail from "./pages/ArchetypeDetail";
import Fractures from "./pages/Fractures";
import Observations from "./pages/Observations";
import Timeline from "./pages/Timeline";
import AncestorDay from "./pages/AncestorDay";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Global handler for unhandled promise rejections to prevent React crashes
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event.reason);
      toast.error("An error occurred. Please try again.");
      // Prevent the default behavior which crashes the application
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleRejection);

    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  return (
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
            <Route path="/charter" element={<Charter />} />
            <Route path="/ancestors" element={<Ancestors />} />
            <Route path="/ancestors/:slug" element={<ArchetypeDetail />} />
            <Route path="/fractures" element={<Fractures />} />
            <Route path="/observations" element={<Observations />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/ancestor-day" element={<AncestorDay />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
