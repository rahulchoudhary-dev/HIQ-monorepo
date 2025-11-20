import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // adjust path if different

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) {
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        const { data: userData, error: dbError } = await supabase
          .from("users")
          .select("id, email, auth_user_id") // select whatever fields you need
          .eq("auth_user_id", user.id)
          .single();

        if (dbError) throw dbError;

        setCurrentUser(userData);
      } catch (err) {
        console.error("Error fetching current user:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  return { currentUser, loading, error };
};

export default useCurrentUser;
