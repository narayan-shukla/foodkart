import { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'
import { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'

const Home = () => {
  const [category,setCategory]=useState("All");
  const { categories } = useContext(StoreContext);
  const [search,setSearch]=useState("");
  return (
    <div>
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory} categories={categories} />
      <section className="food-search" aria-label="Search menu">
        <label htmlFor="food-search-input">Find a favourite</label>
        <input id="food-search-input" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search dishes" />
      </section>
      <FoodDisplay category={category} search={search}/>
      <AppDownload/>
    </div>
  )
}

export default Home
