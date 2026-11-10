import { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/frontend_assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const closeMobile = (value) => { setMenu(value); setMobileOpen(false); };
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    toast.success('Logged out');
    navigate('/');
  };
  return (
    <nav className="navbar" aria-label="Main navigation">
      <Link to="/" aria-label="FoodKart home" className="foodkart-wordmark"><span>Food</span>Kart</Link>
      <ul className={`navbar-menu ${mobileOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={() => closeMobile('home')} className={menu === 'home' ? 'active' : ''}>Home</Link></li>
        <li><a href="/#explore-menu" onClick={() => closeMobile('menu')} className={menu === 'menu' ? 'active' : ''}>Menu</a></li>
        <li><a href="/#app-download" onClick={() => closeMobile('mobile-app')} className={menu === 'mobile-app' ? 'active' : ''}>Mobile app</a></li>
        <li><a href="/#footer" onClick={() => closeMobile('contact-us')} className={menu === 'contact-us' ? 'active' : ''}>About FoodKart</a></li>
      </ul>
      <div className="navbar-right">
        <Link to="/cart" className="navbar-search-icon" aria-label={`Cart${getTotalCartAmount() ? ', items added' : ''}`}>
          <img src={assets.basket_icon} alt="" />
          {getTotalCartAmount() > 0 && <span className="dot" aria-hidden="true" />}
        </Link>
        {!token ? <button type="button" onClick={() => setShowLogin(true)}>Sign in</button> : (
          <div className="navbar-profile">
            <button type="button" aria-label="Account menu"><img src={assets.profile_icon} alt="" /></button>
            <ul className="nav-profile-dropdown"><li><button type="button" onClick={() => navigate('/myorders')}>My orders</button></li><li><button type="button" onClick={logout}>Log out</button></li></ul>
          </div>
        )}
        <button className="navbar-toggle" type="button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}><span /><span /><span /></button>
      </div>
    </nav>
  );
};
export default Navbar;
