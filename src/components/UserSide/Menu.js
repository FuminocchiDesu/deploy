// frontend/src/component/UserSide/Menu.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Menu = ({ coffeeShopId }) => {
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  const fetchMenu = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Owner token not found');
      return;
    }

    const config = {
      headers: { 'Authorization': `Bearer ${token}` }
    };

    try {
      const categoriesResponse = await axios.get(
        `https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-categories/`,
        config
      );
      const itemsResponse = await axios.get(
        `https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-items/`,
        config
      );
      
      console.log('Categories Response:', categoriesResponse.data);
      console.log('Items Response:', itemsResponse.data);
      
      setMenuCategories(categoriesResponse.data);
      setMenuItems(itemsResponse.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized access. Please check your authentication token.');
        // Here you might want to redirect to a login page or refresh the token
      }
    }
  }, [coffeeShopId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Group items by category
  const categorizedItems = menuCategories.map(category => ({
    ...category,
    items: menuItems.filter(item => item.category === category.id)
  }));

  return (
    <div className="read-only-menu">
      {categorizedItems.map(category => (
        <div key={category.id} className="menu-category">
          <h3>{category.name}</h3>
          <ul>
            {category.items.length > 0 ? (
              category.items.map(item => (
                <li key={item.id} className="menu-item">
                  <span>{item.name} - ${item.price}</span>
                  <p>{item.description}</p>
                </li>
              ))
            ) : (
              <li>No items in this category</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Menu;