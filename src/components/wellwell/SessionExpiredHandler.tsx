import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { SessionExpiredModal } from "./SessionExpiredModal";

export function SessionExpiredHandler() {
  const { sessionExpired, refreshSession, dismissSessionExpired } = useAuth();
  const navigate = useNavigate();

  const handleRefresh = async () => {
    const { error } = await refreshSession();
    if (error) {
      // Refresh failed, redirect to sign in
      navigate("/auth");
    }
    // If successful, modal will close automatically via state update
  };

  const handleSignIn = () => {
    dismissSessionExpired();
    navigate("/auth");
  };

  return (
    <SessionExpiredModal
      open={sessionExpired}
      onRefresh={handleRefresh}
      onSignIn={handleSignIn}
    />
  );
}


