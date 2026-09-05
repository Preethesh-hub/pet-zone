import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Not logged in, redirect to login page
    return <Navigate to="/" />;
  }

  // Logged in, render the component
  return children;
}
