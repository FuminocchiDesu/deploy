import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import SidebarMenu from './SideBarMenu';
import './SharedStyles.css';

const API_BASE_URL = 'https://khlcle.pythonanywhere.com';

const MenuPage = ({ handleOwnerLogout }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [promos, setPromos] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [form, setForm] = useState({});
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
    setIsModalVisible(true);
    setForm(record || {});
  };

  const handleModalOk = () => {
    handleSubmit(form);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setForm({});
  };

  const handleSubmit = async (values) => {
    try {
      const config = {
        headers: { 
          Authorization: `Bearer ${ownerToken}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      let formData = new FormData();
      for (let key in values) {
        if (key === 'sizes') {
          formData.append(key, JSON.stringify(values[key]));
        } else if (key === 'image' && values[key] instanceof File) {
          formData.append(key, values[key]);
        } else {
          formData.append(key, values[key]);
        }
      }

      let endpoint;
      let method;

      switch (modalType) {
        case 'category':
          endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-categories/`;
          break;
        case 'item':
          endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/`;
          break;
        case 'promo':
          endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/promos/`;
          break;
        default:
          throw new Error('Invalid modal type');
      }

      if (values.id) {
        endpoint += `${values.id}/`;
        method = 'put';
      } else {
        method = 'post';
      }

      const response = await axios[method](endpoint, formData, config);
      
      if (response.status === 200 || response.status === 201) {
        alert(`${values.id ? 'Update' : 'Create'} successful`);
        setIsModalVisible(false);
        setForm({});
        fetchData();
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Operation failed: ' + (error.response?.data?.error || error.message));
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
                <td key={column.key} className="p-2">{column.render ? column.render(item) : item[column.dataIndex]}</td>
              ))}
              {isEditMode && (
                <td className="p-2">
                  <button className="edit-button mr-2 text-blue-500 hover:text-blue-700" onClick={() => showModal(type, item)}>
                    <EditOutlined />
                  </button>
                  <button className="delete-button text-red-500 hover:text-red-700" onClick={() => handleDelete(type, item.id)}>
                    <DeleteOutlined />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
          {renderTable(items, [
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Description', dataIndex: 'description', key: 'description' },
            { title: 'Category', dataIndex: 'category', key: 'category', render: (item) => item.category.name },
          ], 'item')}
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
          <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="modal-content bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">{`${form.id ? 'Edit' : 'Add'} ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleModalOk(); }}>
                {/* Form fields based on modalType */}
                {/* You'll need to implement the form fields here based on the modalType */}
                <div className="form-actions mt-4 flex justify-end">
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">Save</button>
                  <button type="button" onClick={handleModalCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;