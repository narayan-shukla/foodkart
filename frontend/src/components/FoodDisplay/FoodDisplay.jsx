import { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category, search = "" }) => {
  const { food_list } = useContext(StoreContext);
  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {food_list.map((item, index) => {
          const matchesCategory = category === "All" || category === item.category;
          const matchesSearch = item.name.toLowerCase().includes(search.trim().toLowerCase());
          if (matchesCategory && matchesSearch)
            return (
              <FoodItem
                key={index}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
              />
            );
        })}
        {!food_list.some((item) => (category === "All" || category === item.category) && item.name.toLowerCase().includes(search.trim().toLowerCase())) && <p role="status">No dishes match your search.</p>}
      </div>
    </div>
  );
};

export default FoodDisplay;
