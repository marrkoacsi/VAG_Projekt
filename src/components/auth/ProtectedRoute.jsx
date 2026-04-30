import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute komponens: megnezi h fizetett-e
*/
export default function ProtectedRoute({ children }) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const premiumType = Number(user?.premium_type || 0);


  if (!user || premiumType <= 0) {
    return <Navigate to="/premium" replace />;
  }

  return children;
}
