import { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ url }) => {
  const { token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/order/stats`, { headers: { token } });
      if (!response.data.success) throw new Error(response.data.message || 'Unable to load dashboard');
      setStats(response.data.data);
    } catch (error) { toast.error(error.response?.data?.message || error.message || 'Unable to load dashboard'); }
    finally { setLoading(false); }
  }, [url, token]);
  useEffect(() => { if (!token) navigate('/'); else loadStats(); }, [token, navigate, loadStats]);

  return <main className="admin-dashboard">
    <header className="dashboard-heading"><div><p className="dashboard-eyebrow">FOODKART OVERVIEW</p><h1>Dashboard</h1><p>Current activity across your menu and orders.</p></div><button onClick={loadStats} disabled={loading}>Refresh</button></header>
    {loading && <p role="status">Loading live statistics…</p>}
    {!loading && stats && <div className="dashboard-stats">
      <article><span>Menu items</span><strong>{stats.foodCount}</strong><small>Available in the catalogue</small></article>
      <article><span>Total orders</span><strong>{stats.orderCount}</strong><small>{stats.paidOrderCount} paid</small></article>
      <article><span>Paid revenue</span><strong>${Number(stats.revenue).toFixed(2)}</strong><small>Completed payments only</small></article>
      <article><span>In progress</span><strong>{stats.pendingCount}</strong><small>Paid orders being prepared</small></article>
    </div>}
    {!loading && !stats && <p className="dashboard-empty">Dashboard data is unavailable. Refresh to try again.</p>}
    <p className="dashboard-footnote">Statistics are calculated from the connected FoodKart database.</p>
  </main>;
};
export default Dashboard;
