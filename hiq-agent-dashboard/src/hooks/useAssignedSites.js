import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

/**
 * Hook to get the currently logged-in user's assigned sites
 * Returns an array of site names (e.g., ['NSW', 'VIC', 'QLD'])
 */
export const useAssignedSites = () => {
  const [assignedSiteNames, setAssignedSiteNames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAssignedSites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAssignedSiteNames([])
        setLoading(false)
        return
      }

      // Get user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (userError) {
        throw userError
      }

      if (!userData) {
        setAssignedSiteNames([])
        setLoading(false)
        return
      }

      // Get assigned sites
      const { data: userSites, error: sitesError } = await supabase
        .from('user_sites')
        .select(`
          sites!inner(id, name, display_name)
        `)
        .eq('user_id', userData.id)

      if (sitesError) {
        throw sitesError
      }

      // Extract site names
      const siteNames = userSites?.map((s) => s.sites.name) || []
      setAssignedSiteNames(siteNames)
    } catch (err) {
      console.error('Error fetching assigned sites:', err)
      setError(err.message)
      setAssignedSiteNames([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssignedSites()

    // Set up real-time subscription for user_sites table
    const subscription = supabase
      .channel('user-sites-changes-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_sites' },
        (payload) => {
          console.log('User sites change received:', payload)
          fetchAssignedSites() // Refetch when assignments change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [fetchAssignedSites])

  return { assignedSiteNames, loading, error, refetch: fetchAssignedSites }
}

