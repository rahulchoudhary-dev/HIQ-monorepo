import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { UserPlus, LogOut, User } from 'lucide-react'
import { useContext } from 'react';
import { Moon, Sun } from 'lucide-react';
import { ThemeContext } from '@/App.jsx';
import { Button } from "@/components/ui/button";

// Custom hooks
import { useUsers } from '@/hooks/useUsers'
import { useSites } from '@/hooks/useSites'
import { useUserSites } from '@/hooks/useUserSites'
import { useUserOperations } from '@/hooks/useUserOperations'
import useCurrentUser from '@/hooks/useCurrentUser'

// Components
import StatsCards from '@/components/admin/StatsCards'
import CreateUserForm from '@/components/admin/CreateUserForm'
import EditUserForm from '@/components/admin/EditUserForm'
import UsersTable from '@/components/admin/UsersTable'
import SitesTable from '@/components/admin/SitesTable'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { currentUser } = useCurrentUser()
  const { theme, toggleTheme, setTheme } = useContext(ThemeContext);
  
  // Custom hooks for data management
  const { users, loading: usersLoading, error: usersError, fetchUsers } = useUsers()
  const { sites, loading: sitesLoading, error: sitesError, fetchSites } = useSites()
  const { userSites, loading: userSitesLoading, error: userSitesError, fetchUserSites } = useUserSites()
  const { creating, deleting, error, success, createUser, updateUser, deleteUser, clearMessages } = useUserOperations()

  // UI state
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)

  // Event handlers
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setTheme('light');
      localStorage.removeItem('theme');
      navigate('/login');
    } catch (_e) {}
  };

  const handleUserCreated = async () => {
    await Promise.all([fetchUsers(), fetchUserSites()])
    setShowForm(false)
  }

  const handleUserUpdated = async () => {
    await Promise.all([fetchUsers(), fetchUserSites()])
    setShowEditForm(false)
    setEditingUser(null)
  }

  const handleUserEdit = (user) => {
    setEditingUser(user)
    setShowEditForm(true)
    clearMessages()
  }

  const handleUserDelete = async (user) => {
    const result = await deleteUser(user)
    if (result.success) {
      await Promise.all([fetchUsers(), fetchUserSites()])
    }
  }

  const handleUserSitesUpdate = async () => {
    await fetchUserSites()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-6">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="size-10 rounded-xl bg-black text-white grid place-items-center font-bold tracking-wider">HiQ</div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">User & Site Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentUser?.email && (
              <div className="flex items-center gap-2 text-sm text-foreground px-3 py-2">
                <User className="w-4 h-4" />
                {currentUser.email}
              </div>
            )}
            {/* Dark mode toggle: */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span className="text-sm">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
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

      <main className="flex-1 overflow-auto">
        <div className="max-w-[76rem] mx-auto p-6 space-y-6">
          {/* Stats Cards */}
          <StatsCards users={users} sites={sites} />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)} 
                variant="default"
                size="lg"
                className="gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Add New User
              </Button>
            )}
          </div>

          {/* Create User Form */}
          {showForm && (
            <CreateUserForm 
              sites={sites}
              onUserCreated={handleUserCreated}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Edit User Form */}
          {showEditForm && editingUser && (
            <EditUserForm 
              user={editingUser}
              sites={sites}
              userSites={userSites}
              onUserUpdated={handleUserUpdated}
              onCancel={() => {
                setShowEditForm(false)
                setEditingUser(null)
                clearMessages()
              }}
            />
          )}

          {/* Users Table */}
          <UsersTable 
            sites={sites}
            userSites={userSites}
            onUserEdit={handleUserEdit}
            onUserDelete={handleUserDelete}
            onUserSitesUpdate={handleUserSitesUpdate}
          />

          {/* Sites Table */}
          <SitesTable sites={sites} />
        </div>
      </main>
    </div>
  )
}