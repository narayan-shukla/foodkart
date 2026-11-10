import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer" id="footer">
    <div className="footer-content">
      <div className="footer-content-left">
        <Link to="/" className="footer-wordmark"><span>Food</span>Kart</Link>
        <p>Discover local favourites, order with ease, and follow your FoodKart orders from checkout to delivery.</p>
      </div>
      <div className="footer-content-center">
        <h2>Explore</h2>
        <ul><li><Link to="/">Home</Link></li><li><a href="/#explore-menu">Browse menu</a></li><li><Link to="/cart">Your cart</Link></li></ul>
      </div>
      <div className="footer-content-right">
        <h2>Your FoodKart</h2>
        <ul><li><Link to="/myorders">Order history</Link></li><li><a href="/#explore-menu">Find a dish</a></li></ul>
      </div>
    </div>
    <hr />
    <p className="footer-copyright">© {new Date().getFullYear()} FoodKart</p>
  </footer>
);
export default Footer;
