import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Table, Modal, Form, message, Space, Pagination } from 'antd';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [useMainPrice, setUseMainPrice] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const coffeeShopId = localStorage.getItem('coffeeShopId');
  const ownerToken = localStorage.getItem('ownerToken');
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryPageSize, setCategoryPageSize] = useState(5);
  const [itemPage, setItemPage] = useState(1);
  const [itemPageSize, setItemPageSize] = useState(5);
  const [promoPage, setPromoPage] = useState(1);
  const [promoPageSize, setPromoPageSize] = useState(5);

  const handleCategoryPageChange = (page, pageSize) => {
    setCategoryPage(page);
    setCategoryPageSize(pageSize);
  };

  const handleItemPageChange = (page, pageSize) => {
    setItemPage(page);
    setItemPageSize(pageSize);
  };

  const handlePromoPageChange = (page, pageSize) => {
    setPromoPage(page);
    setPromoPageSize(pageSize);
  };

  const categoryPaginatedData = categories.slice((categoryPage - 1) * categoryPageSize, categoryPage * categoryPageSize);
  const itemPaginatedData = items.slice((itemPage - 1) * itemPageSize, itemPage * itemPageSize);
  const promoPaginatedData = promos.slice((promoPage - 1) * promoPageSize, promoPage * promoPageSize);

  useEffect(() => {
    if (coffeeShopId && ownerToken) {
      fetchData();
    } else {
      message.error('Coffee shop ID or owner token not found');
      handleOwnerLogout();
    }
  }, [coffeeShopId, ownerToken]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = {
        headers: { Authorization: `Bearer ${ownerToken}` }
      };

      const [categoriesResponse, itemsResponse, promosResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-categories/`, config),
        fetch(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/`, config),
        fetch(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/promos/`, config)
      ]);

      const [categoriesData, itemsData, promosData] = await Promise.all([
        categoriesResponse.json(),
        itemsResponse.json(),
        promosResponse.json()
      ]);

      setCategories(categoriesData);
      setItems(itemsData);
      setPromos(promosData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch menu data');
      onLogout();
      if (error.response && error.response.status === 401) {
        message.error('Owner authentication failed. Please log in again.');
     
      } else {
        message.error('Failed to fetch menu data');
      }
    } finally {
      setLoading(false);
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
    if (record) {
      form.setFieldsValue({
        ...record,
        image: record.image ? [{ uid: '-1', name: 'image.png', status: 'done', url: record.image }] : []
      });
      setSizes(record.sizes || []);
      setUseMainPrice(record.price != null);
    } else {
      form.resetFields();
      setSizes([]);
      setUseMainPrice(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
    form.resetFields();
    setSizes([]);
    setUseMainPrice(false);
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      const values = await form.validateFields();
      const formData = new FormData();

      // Append basic form fields
      for (let key in values) {
        if (key === 'sizes') {
          formData.append(key, JSON.stringify(sizes));
        } else if (key === 'image') {
          if (values[key] && values[key][0] && values[key][0].originFileObj) {
            formData.append(key, values[key][0].originFileObj);
          }
        } else if (key !== 'additional_images') {
          formData.append(key, values[key]);
        }
      }

      formData.append('is_available', true);
      formData.append('coffee_shop', coffeeShopId);

      if (modalType === 'item') {
        if (useMainPrice) {
          formData.append('price', values.price);
        } else {
          formData.append('sizes', JSON.stringify(sizes));
        }
      }

      if (values.additional_images) {
        values.additional_images.forEach((file) => {
          if (file.originFileObj) {
            formData.append('additional_images', file.originFileObj);
          }
        });
      }

      let endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/`;
      switch (modalType) {
        case 'category':
          endpoint += 'menu-categories/';
          break;
        case 'item':
          endpoint += 'menu-items/';
          break;
        case 'promo':
          endpoint += 'promos/';
          break;
        default:
          throw new Error('Invalid modal type');
      }

      if (selectedItem && selectedItem.id) {
        endpoint += `${selectedItem.id}/`;
      }

      const config = {
        headers: { Authorization: `Bearer ${ownerToken}` }
      };

      const response = await fetch(endpoint, {
        method: selectedItem ? 'PATCH' : 'POST',
        body: formData,
        headers: config.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      message.success(`${selectedItem ? 'Update' : 'Create'} successful`);
      handleModalClose();
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(`An error occurred while submitting the form: ${error.message}`);
      message.error('Operation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setLoading(true);
        setError(null);
        const config = {
          headers: { Authorization: `Bearer ${ownerToken}` }
        };

        const endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/${type}s/${id}/`;
        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: config.headers
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        message.success('Deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
        setError(`An error occurred while deleting: ${error.message}`);
        if (error.response && error.response.status === 401) {
          message.error('Owner authentication failed. Please log in again.');
          handleOwnerLogout();
        } else {
          message.error('Delete operation failed');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAvailabilityToggle = async (id, currentAvailability) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('is_available', !currentAvailability);

      const config = {
        headers: { Authorization: `Bearer ${ownerToken}` }
      };

      const endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/${id}/`;
      const response = await fetch(endpoint, {
        method: 'PATCH',
        body: formData,
        headers: config.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      fetchData();
      setItems(prevItems => prevItems.map(item =>
        item.id === id ? { ...item, is_available: !currentAvailability } : item
      ));
      message.success('Item availability updated successfully');
    } catch (error) {
      console.error('Error toggling availability:', error);
      setError(`An error occurred while updating availability: ${error.message}`);
      message.error('Failed to update item availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...sizes];
    newSizes[index][field] = value;
    setSizes(newSizes);
  };

  const addSize = () => {
    setSizes([...sizes, { size: '', price: '' }]);
  };

  const removeSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  const handleAdditionalImagesPreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
  };

  // Define fixed column widths for each table
  const categoryColumns = [
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name',
      width: '80%',
      ellipsis: true 
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        isEditMode && (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => showModal('category', record)} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete('category', record.id)} danger />
          </Space>
        )
      ),
    },
  ];

  const itemColumns = [
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name',
      width: '20%',
      ellipsis: true 
    },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description',
      width: '30%',
      ellipsis: true 
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: '15%',
      ellipsis: true,
      render: (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Unknown Category';
      }
    },
    {
      title: 'Availability',
      dataIndex: 'is_available',
      key: 'is_available',
      width: '15%',
      render: (isAvailable, record) => (
        <Button
          type={isAvailable ? 'primary' : 'danger'}
          onClick={() => handleAvailabilityToggle(record.id, isAvailable)}
        >
          {isAvailable ? 'Available' : 'Unavailable'}
        </Button>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        isEditMode && (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => showModal('item', record)} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete('item', record.id)} danger />
          </Space>
        )
      ),
    },
  ];

  const promoColumns = [
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name',
      width: '20%',
      ellipsis: true 
    },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description',
      width: '30%',
      ellipsis: true 
    },
    { 
      title: 'Start Date', 
      dataIndex: 'start_date', 
      key: 'start_date',
      width: '15%' 
    },
    { 
      title: 'End Date', 
      dataIndex: 'end_date', 
      key: 'end_date',
      width: '15%' 
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        isEditMode && (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => showModal('promo', record)} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete('promo', record.id)} danger />
          </Space>
        )
      ),
    },
  ];

  // Common table props to ensure consistent layout
  const tableProps = {
    loading: loading,
    scroll: { x: 800 },
    style: { minHeight: 400 },
    
  };

  return (
    <div className="admin-layout">
      <SidebarMenu
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        onLogout={onLogout}
      />
      <div className="main-content">
        <h1 className="page-title">Menu Management</h1>
        <Button 
          type={isEditMode ? "primary" : "default"}
          onClick={() => setIsEditMode(!isEditMode)}
          className="mb-4"
        >
          {isEditMode ? 'View Mode' : 'Edit Mode'}
        </Button>
        
        <section className="menu-section mb-8">
          <h2 className="text-xl font-semibold mb-2">Categories</h2>
          {isEditMode && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('category')} className="mb-2">
              Add Category
            </Button>
          )}
          <Table 
            {...tableProps}
            dataSource={categories} 
            columns={categoryColumns} 
            rowKey="id"
            pagination={{
              current: categoryPage,
              pageSize: categoryPageSize,
              total: categories.length,
              onChange: (page, pageSize) => {
                setCategoryPage(page);
                setCategoryPageSize(pageSize);
              }
            }}
          />
        </section>

        <section className="menu-section mb-8">
          <h2 className="text-xl font-semibold mb-2">Menu Items</h2>
          {isEditMode && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('item')} className="mb-2">
              Add Item
            </Button>
          )}
          <Table 
            {...tableProps}
            dataSource={items} 
            columns={itemColumns} 
            rowKey="id"
            pagination={{
              current: itemPage,
              pageSize: itemPageSize,
              total: items.length,
              onChange: (page, pageSize) => {
                setItemPage(page);
                setItemPageSize(pageSize);
              }
            }}
          />
        </section>

        <section className="menu-section">
          <h2 className="text-xl font-semibold mb-2">Promos</h2>
          {isEditMode && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('promo')} className="mb-2">
              Add Promo
            </Button>
          )}
          <Table 
            {...tableProps}
            dataSource={promos} 
            columns={promoColumns} 
            rowKey="id"
            pagination={{
              current: promoPage,
              pageSize: promoPageSize,
              total: promos.length,
              onChange: (page, pageSize) => {
                setPromoPage(page);
                setPromoPageSize(pageSize);
              }
            }}
          />
        </section>

        <Modal
          title={`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} Form`}
          visible={isModalVisible}
          onOk={handleFormSubmit}
          onCancel={handleModalClose}
        >
      <Form form={form} layout="vertical">
        <MenuManagementForms
          modalType={modalType}
          categories={categories}
          useMainPrice={useMainPrice}
          setUseMainPrice={setUseMainPrice}
          sizes={sizes}
          handleSizeChange={handleSizeChange}
          addSize={addSize}
          removeSize={removeSize}
          handleAdditionalImagesPreview={handleAdditionalImagesPreview}
        />
      </Form>
      </Modal>
    </div>
    </div>
);
};
export default MenuPage;  