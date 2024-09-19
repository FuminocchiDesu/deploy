import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./frontend.css";

const CoffeeShops = ({ handleLogout }) => {
  const [coffeeShops, setCoffeeShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    refreshCoffeeShops();
  }, []);

  const refreshCoffeeShops = () => {
    axios
      .get("https://khlcle.pythonanywhere.com/api/coffee-shops/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setCoffeeShops(res.data))
      .catch((err) => console.log(err));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredCoffeeShops = coffeeShops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onLogout = () => {
    handleLogout();
    navigate("/login");
  };

  return (
    <div className="contents">
      <div id="account">
        <Link to="/profile" className="profile-link">
          <i className="fas fa-user"></i> Profile
        </Link>
        <button onClick={onLogout} className="logout-button">
          <i className="fas fa-power-off"></i>
        </button>
      </div>
      <div className="header">
        <h1>Find the best local Café near you</h1>
      </div>
      <div className="search-container">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          placeholder="Search by name or address"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <div id="shops-container">
        {filteredCoffeeShops.length ? (
          filteredCoffeeShops.map((shop) => (
            <div id="shop-disp" key={shop.id} className="coffee-shop-card">
              {shop.image && (
                <div className="image-container">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="coffee-shop-image"
                  />
                </div>
              )}
              <div id="text-container">
                <h2>
                  <Link to={`/coffee-shop/${shop.id}`}>{shop.name}</Link>
                </h2>
                <p>{shop.opening_hours}</p>
                <p>{shop.address}</p>
                <p>Rating: {shop.average_rating.toFixed(1)} / 5</p>
                <p>Owner: {shop.owner.username}</p>
              </div>
                <div class="design-box">
                  <div class="arrow">&gt;</div>
                </div>
            </div>
          ))
        ) : (
          <p>No coffee shops found.</p>
        )}
      </div>
      <div className="header">
        <h1>Favorites</h1>
      </div>
    </div>
  );
};
export default CoffeeShops;
