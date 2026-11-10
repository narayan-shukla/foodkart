import { useContext } from 'react';
import './Navbar.css';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const { token, admin, setAdmin, setToken } = useContext(StoreContext);
  const logout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('admin');
    setToken(''); setAdmin(false); toast.success('Logged out'); navigate('/');
  };
  return <header className="navbar">
    <a className="admin-wordmark" href={token && admin ? '/dashboard' : '/'} aria-label="FoodKart admin home"><span>Food</span>Kart <small>ADMIN</small></a>
    {token && admin ? <button type="button" className="login-conditon" onClick={logout}>Log out</button> : <button type="button" className="login-conditon" onClick={() => navigate('/')}>Sign in</button>}
  </header>;
};
export default Navbar;
