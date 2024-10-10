import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import SidebarMenu from './SideBarMenu'; // Adjust the import path as necessary
import { useNavigate } from 'react-router-dom';

const MenuPage = ({ handleOwnerLogout }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [promos, setPromos] = useState([]);
  const [activeTab, setActiveTab] = useState('categories');
  const [error, setError] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('Menu');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('ownerToken');
      const shopId = localStorage.getItem('coffeeShopId');
      
      const [categoriesRes, itemsRes, promosRes] = await Promise.all([
        axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/menu-categories/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/menu-items/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/promos/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setCategories(categoriesRes.data);
      setItems(itemsRes.data);
      setPromos(promosRes.data);
    } catch (err) {
      setError('Failed to fetch menu data. Please try again.');
      console.error('Error fetching menu data:', err);
    }
  };

  const handleCreate = async (type, data) => {
    try {
      const token = localStorage.getItem('ownerToken');
      const shopId = localStorage.getItem('coffeeShopId');
      const endpoint = `https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/${type}/`;
      
      const response = await axios.post(endpoint, data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      fetchData(); // Refresh data after creation
    } catch (err) {
      setError(`Failed to create ${type}. Please try again.`);
      console.error(`Error creating ${type}:`, err);
    }
  };

  const handleUpdate = async (type, id, data) => {
    try {
      const token = localStorage.getItem('ownerToken');
      const shopId = localStorage.getItem('coffeeShopId');
      const endpoint = `https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/${type}/${id}/`;
      
      const response = await axios.put(endpoint, data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      fetchData(); // Refresh data after update
    } catch (err) {
      setError(`Failed to update ${type}. Please try again.`);
      console.error(`Error updating ${type}:`, err);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      const token = localStorage.getItem('ownerToken');
      const shopId = localStorage.getItem('coffeeShopId');
      const endpoint = `https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/${type}/${id}/`;
      
      await axios.delete(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      fetchData(); // Refresh data after deletion
    } catch (err) {
      setError(`Failed to delete ${type}. Please try again.`);
      console.error(`Error deleting ${type}:`, err);
    }
  };

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.name);
    navigate(item.path);
  };

  const onLogout = () => {
    handleOwnerLogout();
    navigate('/admin-login');
  };
  
  return (
    <div className="admin-layout">
      <SidebarMenu
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        onLogout={onLogout}
      />
      
      <main className="main-content">
        <header className="page-header">
          <h1>Menu Management</h1>
        </header>
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      <div className="flex mb-4">
        <button
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'categories' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'items' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('items')}
        >
          Items
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'promos' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('promos')}
        >
          Promos
        </button>
        
      </div>

      {activeTab === 'categories' && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Categories</h2>
          <button
            className="mb-2 flex items-center text-blue-500 hover:text-blue-700"
            onClick={() => handleCreate('menu-categories', { name: 'New Category' })}
          >
            <Plus size={16} className="mr-1" /> Add Category
          </button>
          <ul>
            {categories.map(category => (
              <li key={category.id} className="flex items-center justify-between mb-2">
                <span>{category.name}</span>
                <div>
                  <button
                    className="mr-2 text-yellow-500 hover:text-yellow-700"
                    onClick={() => handleUpdate('menu-categories', category.id, { name: 'Updated Category' })}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete('menu-categories', category.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          
        </div>
      )}

      {activeTab === 'items' && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Menu Items</h2>
          <button
            className="mb-2 flex items-center text-blue-500 hover:text-blue-700"
            onClick={() => handleCreate('menu-items', { name: 'New Item', description: 'Description', category: categories[0]?.id })}
          >
            <Plus size={16} className="mr-1" /> Add Item
          </button>
          <ul>
            {items.map(item => (
              <li key={item.id} className="flex items-center justify-between mb-2">
                <span>{item.name}</span>
                <div>
                  <button
                    className="mr-2 text-yellow-500 hover:text-yellow-700"
                    onClick={() => handleUpdate('menu-items', item.id, { name: 'Updated Item' })}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete('menu-items', item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'promos' && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Promos</h2>
          <button
            className="mb-2 flex items-center text-blue-500 hover:text-blue-700"
            onClick={() => handleCreate('promos', { name: 'New Promo', description: 'Promo Description' })}
          >
            <Plus size={16} className="mr-1" /> Add Promo
          </button>
          <ul>
            {promos.map(promo => (
              <li key={promo.id} className="flex items-center justify-between mb-2">
                <span>{promo.name}</span>
                <div>
                  <button
                    className="mr-2 text-yellow-500 hover:text-yellow-700"
                    onClick={() => handleUpdate('promos', promo.id, { name: 'Updated Promo' })}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete('promos', promo.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
      )}
      </main>
      </div>    
  );
};

export default MenuPage;
