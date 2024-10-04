import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Coffee, Home, LogOut, Edit, User, Star, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import './SharedStyles.css';

export default function Component({ handleOwnerLogout, coffeeShopId }) {
  const [activeMenuItem, setActiveMenuItem] = useState('Menu');
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [promos, setPromos] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: '' });
  const [newPromo, setNewPromo] = useState({ name: '', description: '', start_date: '', end_date: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const navigate = useNavigate();

  const sidebarMenuItems = [
    { name: 'Dashboard', icon: <Home className="menu-icon" />, path: '/dashboard' },
    { name: 'Menu', icon: <Coffee className="menu-icon" />, path: '/dashboard/menu' },
    { name: 'Reviews', icon: <Star className="menu-icon" />, path: '/dashboard/reviews' },
    { name: 'Edit Page', icon: <Edit className="menu-icon" />, path: '/dashboard/page-settings' },
  ];

  const fetchMenuData = useCallback(async () => {
    try {
      const [categoriesResponse, itemsResponse, promosResponse] = await Promise.all([
        axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-categories/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
        }),
        axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-items/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
        }),
        axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/promos/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
        })
      ]);

      setMenuCategories(categoriesResponse.data);
      setMenuItems(itemsResponse.data);
      setPromos(promosResponse.data);
    } catch (error) {
      console.error('Error fetching menu data:', error);
    }
  }, [coffeeShopId]);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.name);
    navigate(item.path);
  };

  const onLogout = () => {
    handleOwnerLogout();
    navigate('/admin-login');
  };

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-categories/`, 
        { name: newCategory.name, coffee_shop: coffeeShopId },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` } }
      );
      setNewCategory({ name: '' });
      fetchMenuData();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const updateCategory = async (categoryId, updatedName) => {
    try {
      await axios.put(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-categories/${categoryId}/`, 
        { name: updatedName },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` } }
      );
      setEditingCategory(null);
      fetchMenuData();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await axios.delete(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-categories/${categoryId}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      fetchMenuData();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-items/`, 
        newItem,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` } }
      );
      setNewItem({ name: '', description: '', price: '', category: '' });
      fetchMenuData();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const updateItem = async (itemId, updatedItem) => {
    try {
      await axios.put(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-items/${itemId}/`, 
        updatedItem,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` } }
      );
      fetchMenuData();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await axios.delete(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/menu-items/${itemId}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      fetchMenuData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const addPromo = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/promos/`, 
        { ...newPromo, coffee_shop: coffeeShopId },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` } }
      );
      setNewPromo({ name: '', description: '', start_date: '', end_date: '' });
      fetchMenuData();
    } catch (error) {
      console.error('Error adding promo:', error);
    }
  };

  const updatePromo = async (promoId, updatedPromo) => {
    try {
      await axios.put(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/promos/${promoId}/`, 
        updatedPromo,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` } }
      );
      fetchMenuData();
    } catch (error) {
      console.error('Error updating promo:', error);
    }
  };

  const deletePromo = async (promoId) => {
    try {
      await axios.delete(`https://khlcle.pythonanywhere.com/api/coffee-shops/${coffeeShopId}/promos/${promoId}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('ownerToken')}` }
      });
      fetchMenuData();
    } catch (error) {
      console.error('Error deleting promo:', error);
    }
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <User className="menu-icon" />
          <span className="admin-title">Admin</span>
          <Bell className="menu-icon" />
        </div>
        <div className="sidebar-search">
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        <nav className="sidebar-menu">
          {sidebarMenuItems.map((item) => (
            <button
              key={item.name}
              className={`menu-item ${activeMenuItem === item.name ? 'active' : ''}`}
              onClick={() => handleMenuItemClick(item)}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <button className="logout-button" onClick={onLogout}>
          <LogOut className="menu-icon" />
          <span>Logout</span>
        </button>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <h1>Menu Management</h1>
        </header>

        <div className="menu-content">
          <div className="card">
            <h2 className="card-title">Categories</h2>
            <form onSubmit={addCategory} className="form-group">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ name: e.target.value })}
                placeholder="New Category Name"
                required
                className="form-input"
              />
              <button type="submit" className="button primary">
                <Plus className="button-icon" /> Add Category
              </button>
            </form>
            {menuCategories.map(category => (
              <div key={category.id} className="category-item">
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
                  <h3>{category.name}</h3>
                )}
                <div className="button-group">
                  <button className="button outline" onClick={() => setEditingCategory(category.id)}>
                    <Edit className="button-icon" /> Edit
                  </button>
                  <button className="button outline" onClick={() => deleteCategory(category.id)}>
                    <Trash2 className="button-icon" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2 className="card-title">Menu Items</h2>
            <form onSubmit={addItem} className="form-group">
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Item Name"
                required
                className="form-input"
              />
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Description"
                className="form-textarea"
              />
              <input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="Price"
                required
                className="form-input"
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                required
                className="form-input"
              >
                <option value="">Select Category</option>
                {menuCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <button type="submit" className="button primary">
                <Plus className="button-icon" /> Add Item
              </button>
            </form>
            {menuItems.map(item => (
              <div key={item.id} className="menu-item">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p>Price: ${item.price}</p>
                <div className="button-group">
                  <button className="button outline" onClick={() => updateItem(item.id, { ...item, name: prompt('Enter new item name:', item.name) || item.name })}>
                    <Edit className="button-icon" /> Edit
                  </button>
                  <button className="button outline" onClick={() => deleteItem(item.id)}>
                    <Trash2 className="button-icon" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2 className="card-title">Promotions</h2>
            <form onSubmit={addPromo} className="form-group">
              <input
                type="text"
                value={newPromo.name}
                onChange={(e) => setNewPromo({ ...newPromo, name: e.target.value })}
                placeholder="Promotion Name"
                required
                className="form-input"
              />
              <textarea
                value={newPromo.description}
                onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                placeholder="Description"
                required
                className="form-textarea"
              />
              <input
                type="date"
                value={newPromo.start_date}
                onChange={(e) => setNewPromo({ ...newPromo, start_date: e.target.value })}
                required
                className="form-input"
              />
              <input
                type="date"
                value={newPromo.end_date}
                onChange={(e) => setNewPromo({ ...newPromo, end_date: e.target.value })}
                required
                className="form-input"
              />
              <button type="submit" className="button primary">
                <Plus className="button-icon" /> Add Promotion
              </button>
            </form>
            {promos.map(promo => (
              <div key={promo.id} className="promo-item">
                <h3>{promo.name}</h3>
                <p>{promo.description}</p>
                <p>Valid from {promo.start_date} to {promo.end_date}</p>
                <div className="button-group">
                  <button className="button outline" onClick={() => updatePromo(promo.id, { ...promo, name: prompt('Enter new promo name:', promo.name) || promo.name })}>
                    <Edit className="button-icon" /> Edit
                  </button>
                  <button className="button outline" onClick={() => deletePromo(promo.id)}>
                    <Trash2 className="button-icon" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}