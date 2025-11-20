import { useEffect, useContext } from "react";
import ReportsTable from "@/components/ReportsTable";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Moon, Sun } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import useCurrentUser from "@/hooks/useCurrentUser";
import { ThemeContext } from "@/App.jsx";
import { Button } from "@/components/ui/button";

export default function ReviewerDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const { theme, toggleTheme, setTheme } = useContext(ThemeContext);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTheme("light");
    localStorage.removeItem("theme");
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border p-6">
          <div className="w-full flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">
                Reviewer Dashboard
              </h1>
              <p className="text-muted-foreground">
                Review and approve reports from your assigned sites
              </p>
            </div>
            <div className="flex items-center gap-3">
              {currentUser?.email && (
                <div className="flex items-center gap-2 text-sm text-foreground px-3 py-2">
                  <User className="w-4 h-4" />
                  {currentUser.email}
                </div>
              )}
              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </span>
              </button>
              <Button
                onClick={() => navigate("/app")}
                variant="outline"
                className="gap-2"
              >
                Upload Reports
              </Button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 border border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-[76rem] mx-auto p-6 space-y-6">
            <ReportsTable />
          </div>
        </main>
      </div>
    </div>
  );
}
