import "./ExploreMenu.css";
import { menu_list } from "../../assets/frontend_assets/assets";

const ExploreMenu = ({ category, setCategory, categories = [] }) => (
  <div className="explore-menu" id="explore-menu">
    <h1>Explore our menu</h1>
    <p className="explore-menu-text">Choose a category to find your next favourite.</p>
    <div className="explore-menu-list" aria-label="Food categories">
      {categories.map((name) => {
        const icon = menu_list.find((item) => item.menu_name.toLowerCase() === name.toLowerCase())?.menu_image;
        return <button type="button" onClick={() => setCategory((current) => current === name ? "All" : name)} key={name} className="explore-menu-list-item" aria-pressed={category === name}>
          {icon ? <img className={category === name ? "active" : ""} src={icon} alt="" /> : <span className={`explore-menu-category-icon ${category === name ? "active" : ""}`} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>}
          <span>{name}</span>
        </button>;
      })}
    </div>
    <hr />
  </div>
);
export default ExploreMenu;
