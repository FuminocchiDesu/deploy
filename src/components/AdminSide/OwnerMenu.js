import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const OwnerMenu = ({ coffeeShopId }) => {
  const [menuCategories, setMenuCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchMenu = useCallback(async () => {
    try {
      const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-categories/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      setMenuCategories(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  }, [coffeeShopId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-categories/`, 
        {
          name: newCategory.name,
          coffee_shop: coffeeShopId
        },
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
        }
      );
      setNewCategory({ name: '' });
      fetchMenu();
    } catch (error) {
      console.error('Error adding category:', error.response ? error.response.data : error.message);
    }
  };

  const updateCategory = async (categoryId, updatedName) => {
    try {
      await axios.put(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-categories/${categoryId}/`, { name: updatedName }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      setEditingCategory(null);
      fetchMenu();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await axios.delete(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-categories/${categoryId}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      fetchMenu();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-items/`, newItem, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      setNewItem({ name: '', description: '', price: '', category: '' });
      fetchMenu();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const updateItem = async (itemId, updatedItem) => {
    try {
      await axios.put(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-items/${itemId}/`, updatedItem, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      fetchMenu();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await axios.delete(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-items/${itemId}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      fetchMenu();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="owner-menu">
      <h3>Menu Management</h3>
      
      {/* Add Category Form */}
      <form onSubmit={addCategory}>
        <input
          type="text"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ name: e.target.value })}
          placeholder="New Category Name"
          required
        />
        <button type="submit">Add Category</button>
      </form>

      {/* Add Item Form */}
      <form onSubmit={addItem}>
        <input
          type="text"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          placeholder="Item Name"
          required
        />
        <input
          type="text"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          placeholder="Description"
        />
        <input
          type="number"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          placeholder="Price"
          required
        />
        <select
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          required
        >
          <option value="">Select Category</option>
          {menuCategories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <button type="submit">Add Item</button>
      </form>

      {/* Display Categories and Items */}
      {menuCategories.map(category => (
        <div key={category.id} className="menu-category">
          <h4>
            {editingCategory === category.id ? (
              <input
                type="text"
                value={category.name}
                onChange={(e) => {
                  const updatedCategories = menuCategories.map(c =>
                    c.id === category.id ? { ...c, name: e.target.value } : c
                  );
                  setMenuCategories(updatedCategories);
                }}
                onBlur={() => updateCategory(category.id, category.name)}
              />
            ) : (
              <>
                {category.name}
                <button onClick={() => setEditingCategory(category.id)}>Edit</button>
              </>
            )}
            <button onClick={() => deleteCategory(category.id)}>Delete</button>
          </h4>
          <ul>
            {category.items && category.items.map(item => (
              <li key={item.id} className="menu-item">
                <span>{item.name} - ${item.price}</span>
                <p>{item.description}</p>
                <button onClick={() => updateItem(item.id, { ...item, name: prompt('Enter new item name:', item.name) })}>Edit</button>
                <button onClick={() => deleteItem(item.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default OwnerMenu;