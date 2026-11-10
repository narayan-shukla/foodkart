import axios from "axios";
import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { calculateCartSubtotal } from "../utils/cart.js";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("foodkart-cart") || "{}"); }
    catch { return {}; }
  });
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [food_list, setFoodList] = useState([]);
  const [categories, setCategories] = useState([]);

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      const response=await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
      if(response.data.success){
        toast.success("item Added to Cart")
      }else{
        toast.error("Something went wrong")
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      const response= await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
      if(response.data.success){
        toast.success("item Removed from Cart")
      }else{
        toast.error("Something went wrong")
      }
    }
  };

  const getTotalCartAmount = useCallback(() => calculateCartSubtotal(cartItems, food_list), [cartItems, food_list]);

  const fetchFoodList = useCallback(async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      if (response.data.success) setFoodList(response.data.data);
      else toast.error(response.data.message || "Menu could not be loaded");
    } catch { toast.error("Menu could not be loaded"); }
  }, [url]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(url + "/api/food/categories");
      if (response.data.success) setCategories(response.data.data.map((category) => category.name));
    } catch { toast.error("Menu categories could not be loaded"); }
  }, [url]);

  const loadCardData = useCallback(async (authToken) => {
    const response = await axios.post(
      url + "/api/cart/get",
      {},
      { headers: { token: authToken } }
    );
    if (response.data.success) setCartItems(response.data.cartData || {});
  }, [url]);

  useEffect(() => {
    localStorage.setItem("foodkart-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      await Promise.all([fetchFoodList(), fetchCategories()]);
      if (active && token) await loadCardData(token);
    }
    loadData();
    return () => { active = false; };
  }, [fetchFoodList, fetchCategories, loadCardData, token]);

  const contextValue = {
    food_list,
    categories,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
