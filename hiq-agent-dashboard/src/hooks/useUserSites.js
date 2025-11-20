import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export const useUserSites = () => {
  const [userSites, setUserSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserSites = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("user_sites").select(`
          *,
          sites!inner(name, display_name),
          users:users!user_id(auth_user_id, email)
        `);
      console.log("data", data);
      if (error) throw error;
      setUserSites(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserSites();

    const userSitesSubscription = supabase
      .channel("user-sites-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_sites" },
        () => fetchUserSites()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userSitesSubscription);
    };
  }, [fetchUserSites]);

  return { userSites, loading, error, fetchUserSites };
};
