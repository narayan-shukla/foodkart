import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';

export default function ProtectedAdmin() {
  const { token, admin, authReady } = useContext(StoreContext);
  if (!authReady) return <p role="status" className="admin-auth-loading">Checking access…</p>;
  if (!token || !admin) return <Navigate to="/" replace />;
  return <Outlet />;
}
