import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import FileUploadSQS from "@/components/FileUploadSQS";
import QLDComplianceForm from "@/components/QLDComplianceForm";
import ReportsTable from "@/components/ReportsTable";
import UserReportsTable from "@/components/UserReportsTable";
import "@/App.css";
import { Moon, Sun, LogOut, Bug, User } from "lucide-react";
import BugReport from "@/pages/BugReport";
import { supabase } from "@/lib/supabaseClient";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAssignedSites } from "@/hooks/useAssignedSites";
import useCurrentUser from "@/hooks/useCurrentUser";
import { ThemeContext } from "@/App.jsx";
import { Button } from "@/components/ui/button";

function UserDashboard() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [response, setResponse] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [showBugForm, setShowBugForm] = useState(false);
  const { session, userRole } = useAuthSession();
  const { currentUser } = useCurrentUser();
  const { assignedSiteNames, loading: sitesLoading } = useAssignedSites();
  const navigate = useNavigate();
  const { theme, toggleTheme, setTheme } = useContext(ThemeContext);

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setResponse(null);
    setUploadedFileName(null);
    setShowBugForm(false);
  };

  const handleResponse = ({ result, fileName, files }) => {
    setResponse(result);
    // Handle both single fileName (from FileUpload/QLDComplianceForm) and files array (from FileUploadSQS)
    if (fileName) {
      setUploadedFileName(fileName);
    } else if (files && files.length > 0) {
      // For FileUploadSQS, use first file name or join if multiple
      setUploadedFileName(files.length === 1 ? files[0] : files.join(", "));
    }
    setShowBugForm(false);
  };

  const handleThemeChange = (newTheme) => setTheme(newTheme);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setTheme('light');
    localStorage.removeItem('theme');
  };

  const isReviewer = userRole === "reviewer";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        selectedAgent={selectedAgent}
        onAgentSelect={handleAgentSelect}
        assignedSiteNames={assignedSiteNames}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-6">
          <div className="w-full flex justify-between items-center">
            <div>
              {selectedAgent ? (
                <>
                  <h1 className="text-2xl font-semibold text-foreground mb-2">
                    {selectedAgent.name}
                  </h1>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {selectedAgent.description}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-semibold text-foreground mb-2">
                    HiQ Agent Testing Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    {isReviewer
                      ? "Review and approve reports from your assigned sites"
                      : "Select an agent from the sidebar to begin testing"}
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentUser?.email && (
                <div className="flex items-center gap-2 text-sm text-foreground px-3 py-2">
                  <User className="w-4 h-4" />
                  {currentUser.email}
                </div>
              )}
              {isReviewer && (
                <Button
                  onClick={() => navigate("/reviewer")}
                  variant="outline"
                  className="gap-2"
                >
                  Back to Review
                </Button>
              )}
              <Button
                onClick={() => setShowBugForm(true)}
                variant="outline"
                className="gap-2"
              >
                <Bug className="w-4 h-4" />
                Report a Bug
              </Button>

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

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-[76rem] mx-auto p-6 space-y-6">
            {/* Conditional Rendering based on Agent Type */}
            <div
              className={[
                !response
                  ? "min-h-[60vh] flex items-center justify-center"
                  : "",
              ].join(" ")}
            >
              {selectedAgent?.hasCustomForm ? (
                <QLDComplianceForm
                  agent={selectedAgent}
                  onResponse={handleResponse}
                  authUserId={currentUser?.auth_user_id}
                />
              ) : (
                <FileUploadSQS
                  agent={selectedAgent}
                  onResponse={handleResponse}
                />
              )}
            </div>


            {/* User Reports Table - Show for everyone on upload page */}
            <div className="mt-8">
              <UserReportsTable />
            </div>

            {/* Bug Report Form */}
            {showBugForm && (
              <BugReport
                selectedAgent={selectedAgent}
                defaultFileName={uploadedFileName}
                onClose={() => setShowBugForm(false)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserDashboard;
