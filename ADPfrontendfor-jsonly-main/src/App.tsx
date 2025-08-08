
import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import Login from "@/auth/components/Login";
import PasswordResetRequest from "@/auth/components/PasswordResetRequest";
import PasswordResetConfirm from "@/auth/components/PasswordResetConfirm";
import DocumentViewer from "@/documents/pages/DocumentViewer";
import UserDashboard from "@/dashboard/pages/UserDashboard";
import AdminDashboard from "@/admin/pages/AdminDashboard";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import { useEffect } from "react";
import useBranding from "@/shared/hooks/useBranding";

const queryClient = new QueryClient();

const App = () => {
  const branding = useBranding();

  useEffect(() => {
  const hostname = window.location.hostname;

  // ✅ Title based on domain
  document.title =
    hostname === "adp.automationedge.com"
      ? "ADP - AutomationEdge"
      : "ADP - ValueDX";

  // ✅ Dynamic favicon logic
  const faviconFilename =
    hostname === "adp.automationedge.com"
      ? "automationedge-logo.png"
      : "vdx-logo.png";

  // ✅ Add cache-busting query param
  const faviconHref = `/${faviconFilename}?v=${Date.now()}`;

  // ✅ Update or create favicon element
  let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;

  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    document.head.appendChild(favicon);
  }

  favicon.href = faviconHref;
}, []);

  return (
    <QueryClientProvider client={new QueryClient()}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/password-reset" element={<PasswordResetRequest />} />
            <Route
              path="/password-reset-confirm"
              element={<PasswordResetConfirm />}
            />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/uploaddoc" element={<Upload />} />
            <Route path="/document/:id" element={<DocumentViewer />} />
            <Route path="userdashboard" element={<UserDashboard />} />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute requiredUserType="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
