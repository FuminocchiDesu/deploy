import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './SharedStyles.css';

const OwnerMenu = ({ coffeeShopId }) => {
  const [menuCategories, setMenuCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 0 });
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
      console.error('Error adding category:', error);
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
      setNewItem({ name: '', description: '', price: '', category: 0 });
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
      <div className="card">
        <h3 className="card-title">Add New Category</h3>
        <form onSubmit={addCategory} className="form-group">
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) => setNewCategory({name: e.target.value})}
            placeholder="New Category Name"
            required
            className="form-input"
          />
          <button type="submit" className="button primary">Add Category</button>
        </form>
      </div>

      <div className="card">
        <h3 className="card-title">Add New Menu Item</h3>
        <form onSubmit={addItem} className="form-group">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            placeholder="Item Name"
            required
            className="form-input"
          />
          <textarea
            value={newItem.description}
            onChange={(e) => setNewItem({...newItem, description: e.target.value})}
            placeholder="Description"
            className="form-textarea"
          />
          <input
            type="number"
            value={newItem.price}
            onChange={(e) => setNewItem({...newItem, price: e.target.value})}
            placeholder="Price"
            required
            className="form-input"
          />
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({...newItem, category: parseInt(e.target.value)})}
            className="form-input"
          >
            <option value={0}>Select Category</option>
            {menuCategories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <button type="submit" className="button primary">Add Item</button>
        </form>
      </div>

      {menuCategories.map(category => (
        <div key={category.id} className="card">
          <div className="card-header">
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
                className="form-input"
              />
            ) : (
              <>
                <h3 className="card-title">{category.name}</h3>
                <button className="button outline" onClick={() => setEditingCategory(category.id)}>Edit</button>
              </>
            )}
            <button className="button outline" onClick={() => deleteCategory(category.id)}>Delete</button>
          </div>
          <div className="menu-items">
            {category.items && category.items.map(item => (
              <div key={item.id} className="dish-card">
                <h4 className="dish-title">{item.name}</h4>
                <p className="dish-price">${item.price}</p>
                <p>{item.description}</p>
                <div className="action-buttons">
                  <button className="button outline" onClick={() => updateItem(item.id, { ...item, name: prompt('Enter new item name:', item.name) || item.name })}>Edit</button>
                  <button className="button outline" onClick={() => deleteItem(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OwnerMenu;