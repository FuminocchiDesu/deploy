import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import SidebarMenu from './SideBarMenu';
import MenuManagementForms from './MenuManagementForms';
import './SharedStyles.css';

const API_BASE_URL = 'https://khlcle.pythonanywhere.com';

const MenuPage = ({ handleOwnerLogout }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [promos, setPromos] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('Menu');
  const navigate = useNavigate();
  const coffeeShopId = localStorage.getItem('coffeeShopId');
  const ownerToken = localStorage.getItem('ownerToken');

  useEffect(() => {
    if (coffeeShopId && ownerToken) {
      fetchData();
    } else {
      console.error('Coffee shop ID or owner token not found');
      handleOwnerLogout();
    }
  }, [coffeeShopId, ownerToken]);

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${ownerToken}` }
      };

      const [categoriesResponse, itemsResponse, promosResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-categories/`, config),
        axios.get(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/`, config),
        axios.get(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/promos/`, config)
      ]);
      setCategories(categoriesResponse.data);
      setItems(itemsResponse.data);
      setPromos(promosResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response && error.response.status === 401) {
        alert('Owner authentication failed. Please log in again.');
        handleOwnerLogout();
      } else {
        alert('Failed to fetch menu data');
      }
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

  const showModal = (type, record = null) => {
    setModalType(type);
    setSelectedItem(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const handleFormSubmit = async (formData, error) => {
    if (error) {
      alert('Error: ' + error);
    } else {
      alert('Operation successful');
      handleModalClose();
      fetchData();
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${ownerToken}` }
        };

        let endpoint;
        switch (type) {
          case 'category':
            endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-categories/${id}/`;
            break;
          case 'item':
            endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/${id}/`;
            break;
          case 'promo':
            endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/promos/${id}/`;
            break;
          default:
            throw new Error('Invalid delete type');
        }

        await axios.delete(endpoint, config);
        alert('Deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
        if (error.response && error.response.status === 401) {
          alert('Owner authentication failed. Please log in again.');
          handleOwnerLogout();
        } else {
          alert('Delete operation failed');
        }
      }
    }
  };

  const handleAvailabilityToggle = async (id, currentAvailability) => {
    try {
      const formData = new FormData();
      formData.append('is_available', !currentAvailability);
  
      const config = {
        headers: { 
          'Authorization': `Bearer ${ownerToken}`,
          'Content-Type': 'multipart/form-data'
        }
      };
  
      const endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/${id}/`;
      await axios.patch(endpoint, formData, config);
      fetchData();
      // Update the local state immediately
      setItems(prevItems => prevItems.map(item => 
        item.id === id ? { ...item, is_available: !currentAvailability } : item
      ));
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to update item availability');
    }
  };

  const renderTable = (data, columns, type) => (
    <div className="overflow-x-auto">
      <table className="menu-table w-full">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="text-left p-2 bg-gray-100">{column.title}</th>
            ))}
            {isEditMode && <th className="text-left p-2 bg-gray-100">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b">
              {columns.map((column) => (
                <td key={column.key} className="p-2">
                  {column.render ? column.render(item[column.dataIndex]) : item[column.dataIndex]}
                </td>
              ))}
              {isEditMode && (
                <td className="p-2">
                  <button className="edit-button mr-2 text-blue-500 hover:text-blue-700" onClick={() => showModal(type, item)}>
                    <EditOutlined />
                  </button>
                  <button className="delete-button text-red-500 hover:text-red-700" onClick={() => handleDelete(type, item.id)}>
                    <DeleteOutlined />
                  </button>
                  {type === 'item' && (
                    <button
                      className={`ml-2 px-2 py-1 rounded ${
                        !item.is_available 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}
                      onClick={() => handleAvailabilityToggle(item.id, item.is_available)}
                    >
                      {!item.is_available ? 'Unavailable' : 'Available'}
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const itemColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category', 
      render: (category) => {
        const categoryObj = categories.find(cat => cat.id === category);
        return categoryObj ? categoryObj.name : 'Unknown Category';
      }
    },
    { 
      title: 'Availability', 
      dataIndex: 'is_available', 
      key: 'is_available',
      render: (isAvailable) => (        
        <span className={`px-2 py-1 rounded ${
          isAvailable 
            ? 'bg-green-500 text-green' 
            : 'bg-red-500 text-red'
        }`}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>
      )
    },
  ];

  return (
    <div className="admin-layout">
      <SidebarMenu
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        onLogout={onLogout}
      />
      <div className="main-content">
        <h1 className="page-title text-2xl font-bold mb-4">Menu Management</h1>
        <button 
          className="toggle-edit-button mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
          onClick={() => setIsEditMode(!isEditMode)}
        >
          {isEditMode ? 'View Mode' : 'Edit Mode'}
        </button>
        
        <section className="menu-section mb-8">
          <h2 className="text-xl font-semibold mb-2">Categories</h2>
          {isEditMode && (
            <button className="add-button mb-2 text-blue-500 hover:text-blue-700 flex items-center" onClick={() => showModal('category')}>
              <PlusOutlined className="mr-1" /> Add Category
            </button>
          )}
          {renderTable(categories, [{ title: 'Name', dataIndex: 'name', key: 'name' }], 'category')}
        </section>

        <section className="menu-section mb-8">
          <h2 className="text-xl font-semibold mb-2">Menu Items</h2>
          {isEditMode && (
            <button className="add-button mb-2 text-blue-500 hover:text-blue-700 flex items-center" onClick={() => showModal('item')}>
              <PlusOutlined className="mr-1" /> Add Item
            </button>
          )}
          {renderTable(items, itemColumns, 'item')}
        </section>

        <section className="menu-section">
          <h2 className="text-xl font-semibold mb-2">Promos</h2>
          {isEditMode && (
            <button className="add-button mb-2 text-blue-500 hover:text-blue-700 flex items-center" onClick={() => showModal('promo')}>
              <PlusOutlined className="mr-1" /> Add Promo
            </button>
          )}
          {renderTable(promos, [
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Description', dataIndex: 'description', key: 'description' },
            { title: 'Start Date', dataIndex: 'start_date', key: 'start_date' },
            { title: 'End Date', dataIndex: 'end_date', key: 'end_date' },
          ], 'promo')}
        </section>

        {isModalVisible && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
      <MenuManagementForms
        onSubmit={handleFormSubmit}
        initialData={selectedItem}
        formType={modalType}
        categories={categories}
      />
      <button onClick={handleModalClose} className="mt-4 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
        Close
      </button>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default MenuPage;