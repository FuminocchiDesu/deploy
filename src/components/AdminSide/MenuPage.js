import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Table, Modal, Form, Input, DatePicker, message, Select, Upload, Space, Checkbox } from 'antd';
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
      if (error.response && error.response.status === 401) {
        message.error('Owner authentication failed. Please log in again.');
        handleOwnerLogout();
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
      for (let key in values) {
        if (key === 'sizes') {
          formData.append(key, JSON.stringify(sizes));
        } else if (key === 'image') {
          if (values[key] && values[key][0] && values[key][0].originFileObj) {
            formData.append(key, values[key][0].originFileObj);
          }
        } else {
          formData.append(key, values[key]);
        }
      }

      formData.append('coffee_shop', coffeeShopId);

      if (modalType === 'item') {
        if (useMainPrice) {
          formData.append('price', values.price);
        } else {
          formData.append('sizes', JSON.stringify(sizes));
        }
      }
      console.log('Submitting data:', Object.fromEntries(formData));

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

    if (selectedItem && selectedItem.id) {
      endpoint += `${selectedItem.id}/`;
      method = 'PATCH';
    } else {
      method = 'POST';
    }

    console.log('Submitting to endpoint:', endpoint);
    console.log('Using method:', method);
    console.log('Submitting data:', Object.fromEntries(formData));

    const config = {
      headers: { 
        Authorization: `Bearer ${ownerToken}`,
      }
    };

    const response = await fetch(endpoint, {
      method,
      body: formData,
      headers: config.headers
    });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
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
        headers: { 
          'Authorization': `Bearer ${ownerToken}`,
          'Content-Type': 'multipart/form-data'
        }
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

  const categoryColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Actions',
      key: 'actions',
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
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category',
      render: (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Unknown Category';
      }
    },
    { 
      title: 'Availability', 
      dataIndex: 'is_available', 
      key: 'is_available',
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
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Start Date', dataIndex: 'start_date', key: 'start_date' },
    { title: 'End Date', dataIndex: 'end_date', key: 'end_date' },
    {
      title: 'Actions',
      key: 'actions',
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
          <Table dataSource={categories} columns={categoryColumns} rowKey="id" />
        </section>

        <section className="menu-section mb-8">
          <h2 className="text-xl font-semibold mb-2">Menu Items</h2>
          {isEditMode && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('item')} className="mb-2">
              Add Item
            </Button>
          )}
          <Table dataSource={items} columns={itemColumns} rowKey="id" />
        </section>

        <section className="menu-section">
          <h2 className="text-xl font-semibold mb-2">Promos</h2>
          {isEditMode && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('promo')} className="mb-2">
              Add Promo
            </Button>
          )}
          <Table dataSource={promos} columns={promoColumns} rowKey="id" />
        </section>

        <Modal
          title={`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} Form`}
          visible={isModalVisible}
          onOk={handleFormSubmit}
          onCancel={handleModalClose}
        >
          <Form form={form} layout="vertical">
            {modalType === 'category' && (
              <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            )}
            {modalType === 'item' && (
              <>
                <Form.Item name="name" label="Item Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                  <Input.TextArea />
                </Form.Item>
                <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                  <Select>
                    {categories.map(category => (
                      <Select.Option key={category.id} value={category.id}>{category.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="image" label="Image" valuePropName="fileList" getValueFromEvent={(e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e && e.fileList;
                }}>
                  <Upload 
                    beforeUpload={() => false}
                    listType="picture"
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Click to upload</Button>
                  </Upload>
                </Form.Item>
                <Form.Item name="useMainPrice" valuePropName="checked">
                  <Checkbox onChange={(e) => setUseMainPrice(e.target.checked)}>
                    Use main price (no sizes)
                  </Checkbox>
                </Form.Item>
                {useMainPrice ? (
                  <Form.Item name="price" label="Price" rules={[{ required: true }]}>
                    <Input type="number" step="0.01" />
                  </Form.Item>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sizes and Prices</label>
                    {sizes.map((size, index) => (
                      <div key={index} className="flex items-center space-x-2 mt-2">
                        <Input
                          value={size.size}
                          onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                          placeholder="Size"
                          className="w-1/3"
                        />
                        <Input
                          type="number"
                          value={size.price}
                          onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                          placeholder="Price"
                          step="0.01"
                          className="w-1/3"
                        />
                        <Button onClick={() => removeSize(index)} icon={<DeleteOutlined />} />
                      </div>
                    ))}
                    <Button type="dashed" onClick={addSize} className="mt-2">
                      + Add Size
                    </Button>
                  </div>
                )}
              </>
            )}
            {modalType === 'promo' && (
              <>
                <Form.Item name="name" label="Promo Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                  <Input.TextArea />
                </Form.Item>
                <Form.Item name="start_date" label="Start Date" rules={[{ required: true }]}>
                  <DatePicker />
                </Form.Item>
                <Form.Item name="end_date" label="End Date" rules={[{ required: true }]}>
                  <DatePicker />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default MenuPage;