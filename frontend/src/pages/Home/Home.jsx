import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = () => {
  const [category,setCategory]=useState("All");
  const [search,setSearch]=useState("");
  return (
    <div>
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory} />
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
