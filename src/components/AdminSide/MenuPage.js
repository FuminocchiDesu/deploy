import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Table, Modal, Form, Input, DatePicker, message, Select, Upload, Space } from 'antd';
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
        message.error('Owner authentication failed. Please log in again.');
        handleOwnerLogout();
      } else {
        message.error('Failed to fetch menu data');
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
    if (record) {
      form.setFieldsValue({
        ...record,
        image: record.image ? [{ uid: '-1', name: 'image.png', status: 'done', url: record.image }] : []
      });
    } else {
      form.resetFields();
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
    form.resetFields();
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      for (let key in values) {
        if (key === 'sizes') {
          formData.append(key, JSON.stringify(values[key]));
        } else if (key === 'image') {
          if (values[key] && values[key][0] && values[key][0].originFileObj) {
            formData.append(key, values[key][0].originFileObj);
          }
        } else {
          formData.append(key, values[key]);
        }
      }

      const config = {
        headers: { 
          Authorization: `Bearer ${ownerToken}`,
          'Content-Type': 'multipart/form-data'
        }
      };

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
        method = 'put';
      } else {
        method = 'post';
      }

      const response = await axios[method](endpoint, formData, config);
      
      if (response.status === 200 || response.status === 201) {
        message.success(`${selectedItem ? 'Update' : 'Create'} successful`);
        handleModalClose();
        fetchData();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Operation failed: ' + (error.response?.data?.error || error.message));
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
        message.success('Deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
        if (error.response && error.response.status === 401) {
          message.error('Owner authentication failed. Please log in again.');
          handleOwnerLogout();
        } else {
          message.error('Delete operation failed');
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
      setItems(prevItems => prevItems.map(item => 
        item.id === id ? { ...item, is_available: !currentAvailability } : item
      ));
      message.success('Item availability updated successfully');
    } catch (error) {
      console.error('Error toggling availability:', error);
      message.error('Failed to update item availability');
    }
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
                <Form.List name="sizes" rules={[{ required: true, message: 'Please add at least one size' }]}>
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                          <Form.Item
                            {...restField}
                            name={[name, 'size']}
                            rules={[{ required: true, message: 'Missing size' }]}
                          >
                            <Input placeholder="Size" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'price']}
                            rules={[{ required: true, message: 'Missing price' }]}
                          >
                            <Input placeholder="Price" />
                          </Form.Item>
                          <Button onClick={() => remove(name)} type="text" danger icon={<DeleteOutlined />} />
                        </Space>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                          Add Size
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
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