import { useState, useMemo, useContext } from "react";
import { FileText, Bot, Search, Menu, Sun, Moon } from "lucide-react";
import { ThemeContext } from '@/App.jsx';

const agents = [
  {
    id: "unified-flow-nsw",
    name: "NSW Compliance Agent",
    description: `Runs all agents in sequence, gathers their results,\nand provides a single consolidated view of statuses and responses for NSW.`,
    icon: FileText,
    site: "NSW",
  },
  {
    id: "unified-flow-vic",
    name: "VIC Compliance Agent",
    description: `Runs all agents in sequence, gathers their results,\nand provides a single consolidated view of statuses and responses for VIC.`,
    icon: FileText,
    site: "VIC",
  },
  // {
  //   id: "qld-compliance-checker",
  //   name: "QLD Waste Compliance Checker",
  //   description: `Submit relevant texts and images for QLD waste compliance checking.`,
  //   icon: FileText,
  //   site: "QLD",
  //   hasCustomForm: true,
  //   webhook: "https://gluagents.xyz/webhook/a69f19d3-cd8c-4a13-9ed8-7df49d7c39b1",
  // },
];

export default function Sidebar({
  selectedAgent,
  onAgentSelect,
  theme: themeProp,
  onThemeChange: onThemeChangeProp,
  collapsed = false,
  onToggleCollapse,
  assignedSiteNames = [], // Add prop to receive assigned sites
}) {
  const { theme: ctxTheme, toggleTheme: ctxToggleTheme } = useContext(ThemeContext);
  const theme = themeProp || ctxTheme;
  const onThemeChange = onThemeChangeProp || ctxToggleTheme;
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Filter agents based on assigned sites and search
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      // Filter by assigned sites - if no sites assigned, show all (for admin/fallback)
      const matchesAssignedSites = 
        assignedSiteNames.length === 0 || 
        !agent.site || 
        assignedSiteNames.includes(agent.site);
      
      // Filter by search query
      const matchesSearch =
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesAssignedSites && matchesSearch;
    });
  }, [searchQuery, statusFilter, categoryFilter, assignedSiteNames]);

  // Sort agents by name
  const sortedAgents = useMemo(() => {
    return [...filteredAgents].sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredAgents]);

  if (collapsed) {
    return (
      <div className="w-16 bg-[var(--color-sidebar)] border-r border-[var(--color-sidebar-border)] h-screen flex flex-col">
        <div className="p-4 border-b border-[var(--color-sidebar-border)]">
          <button
            onClick={onToggleCollapse}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-sidebar)] border border-[var(--color-sidebar-border)] hover:border-[var(--color-sidebar-ring)] hover:shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sidebar-ring)]"
            title="Expand sidebar"
          >
            <Menu className="w-5 h-5 text-[var(--color-sidebar-foreground)]" />
          </button>
        </div>

        <div className="flex-1 p-2 space-y-2">
          {sortedAgents.slice(0, 3).map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedAgent?.id === agent.id;

            return (
              <button
                key={agent.id}
                onClick={() => onAgentSelect(agent)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 relative group ${
                  isSelected
                    ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                    : "hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)] hover:text-[var(--sidebar-accent-foreground)]"
                }`}
                title={agent.name}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[var(--color-sidebar)] border-r border-[var(--color-sidebar-border)] h-screen flex flex-col text-[var(--color-sidebar-foreground)]">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-sidebar-border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-8 h-8 text-[var(--sidebar-primary)]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-sidebar-foreground)]">
                HiQ Agent Testing
              </h1>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* User Profile */}
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-[var(--color-sidebar-border)]">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--color-sidebar-border)] rounded-lg bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)] placeholder-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sidebar-ring)] focus:border-transparent"
          />
        </div>

        {showFilters && (
          <div className="mt-3 space-y-3 p-3 bg-[var(--color-card)] rounded-lg">
            <div>
              <label className="block text-sm font-medium text-[var(--color-sidebar-foreground)] mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-[var(--color-sidebar-border)] rounded-lg bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-sidebar-ring)]"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-sidebar-foreground)] mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-[var(--color-sidebar-border)] rounded-lg bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-sidebar-ring)]"
              >
                <option value="all">All Categories</option>
                <option value="document">Document</option>
                <option value="analysis">Analysis</option>
                <option value="organization">Organization</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[var(--color-sidebar-foreground)] uppercase tracking-wide">
              Available Agents ({sortedAgents.length})
            </h2>
          </div>

          <div className="space-y-2">
            {sortedAgents.map((agent) => {
              const Icon = agent.icon;
              const isSelected = selectedAgent?.id === agent.id;

              return (
                <div
                  key={agent.id}
                  className={`relative group rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "bg-[var(--sidebar-accent)] border-[var(--sidebar-ring)] shadow-sm"
                      : "bg-[var(--color-sidebar)] border-[var(--color-sidebar-border)] hover:border-[var(--sidebar-ring)] hover:shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => onAgentSelect(agent)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected
                              ? "bg-[var(--sidebar-accent)]"
                              : "bg-[var(--color-card)] group-hover:bg-[var(--sidebar-accent)]"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              isSelected
                                ? "text-[var(--sidebar-accent-foreground)]"
                                : "text-[var(--color-sidebar-foreground)] group-hover:text-[var(--sidebar-accent-foreground)]"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-[var(--color-sidebar-foreground)] truncate">
                            {agent.name}
                          </h3>
                          {agent.site && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                                agent.site === "NSW"
                                  ? "bg-[var(--sidebar-accent)] text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {agent.site}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2 whitespace-pre-line mb-2">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {sortedAgents.length === 0 && (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-[var(--color-muted-foreground)] mx-auto mb-3" />
              <p className="text-[var(--color-muted-foreground)]">
                No agents found
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--color-sidebar-border)]" />
    </div>
  );
}
