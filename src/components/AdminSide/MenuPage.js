import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SidebarMenu from './SideBarMenu';
import MenuManagementForms from './MenuManagementForms';

const MenuPage = ({ handleOwnerLogout }) => {
  const [categories, setCategories] = useState([]);
  const [promos, setPromos] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [activeMenuItem, setActiveMenuItem] = useState('Menu');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('ownerToken');
      const shopId = localStorage.getItem('coffeeShopId');
      
      const response = await axios.get(`https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/menu-and-promos/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setCategories(response.data.menu_categories);
      setPromos(response.data.promos);
    } catch (err) {
      setError('Failed to fetch menu data. Please try again.');
      console.error('Error fetching menu data:', err);
    }
  };

  const handleCreate = (type) => {
    setFormType(type);
    setEditingItem(null);
    setShowForm(true);
  };
  
  const handleUpdate = (type, item) => {
    setFormType(type);
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormSubmit = (data, error) => {
  if (error) {
    setError(error);
  } else {
    setShowForm(false);
    setEditingItem(null);
    fetchData();
  }
};

  const handleDelete = async (type, id) => {
    if (isReadOnly) return;
    try {
      const token = localStorage.getItem('ownerToken');
      const shopId = localStorage.getItem('coffeeShopId');
      const endpoint = `https://khlcle.pythonanywhere.com/api/coffee-shops/${shopId}/menu-and-promos/${id}/manage_${type}/`;
      
      await axios.delete(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      fetchData();
    } catch (err) {
      setError(`Failed to delete ${type}. Please try again.`);
      console.error(`Error deleting ${type}:`, err);
    }
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderMenuTab = () => (
    <div>
      <h2 className="text-xl font-semibold mb-2">Menu Categories and Items</h2>
      {!isReadOnly && (
  <button
    className="mb-2 flex items-center text-blue-500 hover:text-blue-700"
    onClick={() => handleCreate('category')}
  >
    <Plus size={16} className="mr-1" /> Add Category
  </button>
)}
      <ul>
        {categories.map(category => (
          <li key={category.id} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{category.name}</span>
              <div className="flex items-center">
              {!isReadOnly && (
  <>
    <button
      className="mr-2 text-yellow-500 hover:text-yellow-700"
      onClick={() => handleUpdate('category', category)}
    >
      <Edit size={16} />
    </button>
    <button
      className="mr-2 text-red-500 hover:text-red-700"
      onClick={() => handleDelete('category', category.id)}
    >
      <Trash2 size={16} />
    </button>
  </>
)}
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => toggleCategoryExpansion(category.id)}
                >
                  {expandedCategories[category.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>
            {expandedCategories[category.id] && (
              <ul className="ml-4">
                {category.items.map(item => (
                  <li key={item.id} className="mb-2">
                    <div className="flex items-center justify-between">
                      <span>{item.name}</span>
                      {!isReadOnly && (
                        <div>
                          <button
                            className="mr-2 text-yellow-500 hover:text-yellow-700"
                            onClick={() => handleUpdate('item', item.id, { name: 'Updated Item' })}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete('item', item.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-32 h-32 object-cover mt-2" />
                    )}
                    <ul className="ml-4 text-sm">
                      {item.sizes.map((size, index) => (
                        <li key={index}>
                          {size.size}: {size.price}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
                {!isReadOnly && (
  <li>
    <button
      className="mt-2 flex items-center text-blue-500 hover:text-blue-700"
      onClick={() => handleCreate('item')}
    >
      <Plus size={14} className="mr-1" /> Add Item
    </button>
  </li>
)}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderPromosTab = () => (
    <div>
      <h2 className="text-xl font-semibold mb-2">Promos</h2>
      {!isReadOnly && (
        <button
          className="mb-2 flex items-center text-blue-500 hover:text-blue-700"
          onClick={() => handleCreate('promo', { name: 'New Promo', description: 'Promo Description', start_date: new Date().toISOString().split('T')[0], end_date: new Date().toISOString().split('T')[0] })}
        >
          <Plus size={16} className="mr-1" /> Add Promo
        </button>
      )}
      <ul>
        {promos.map(promo => (
          <li key={promo.id} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{promo.name}</span>
              {!isReadOnly && (
                <div>
                  <button
                    className="mr-2 text-yellow-500 hover:text-yellow-700"
                    onClick={() => handleUpdate('promo', promo.id, { name: 'Updated Promo' })}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete('promo', promo.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">{promo.description}</p>
            <p className="text-sm text-gray-500">
              {new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}
            </p>
            {promo.image && (
              <img src={promo.image} alt={promo.name} className="w-32 h-32 object-cover mt-2" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );

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
          <h1 className="text-2xl font-bold mb-4">Menu and Promos Management</h1>
          <button
  className={`px-4 py-2 rounded ${isReadOnly ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
  onClick={() => setIsReadOnly(!isReadOnly)}
>
  {isReadOnly ? <><Eye size={16} className="inline mr-2" /> View Mode</> : <><Edit size={16} className="inline mr-2" /> Edit Mode</>}
</button>
        </header>
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}
  {showForm && (
        <MenuManagementForms
          onSubmit={handleFormSubmit}
          initialData={editingItem}
          formType={formType}
          categories={categories}
        />
      )}
        <div className="flex mb-4">
          <button
            className={`mr-2 px-4 py-2 rounded ${activeTab === 'menu' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('menu')}
          >
            Menu
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'promos' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('promos')}
          >
            Promos
          </button>
        </div>

        {activeTab === 'menu' ? renderMenuTab() : renderPromosTab()}
      </main>
    </div>
  );
};

export default MenuPage;