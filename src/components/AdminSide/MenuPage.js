import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Modal, Form, Input, DatePicker, message, Select, Upload, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import SidebarMenu from './SideBarMenu'; // Import the SidebarMenu component
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://khlcle.pythonanywhere.com'; // Update this to your actual API base URL

const MenuPage = ({ handleOwnerLogout }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [promos, setPromos] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [form] = Form.useForm();
  const [activeMenuItem, setActiveMenuItem] = useState('Reviews');
  const navigate = useNavigate();
  const coffeeShopId = localStorage.getItem('coffeeShopId');
  const ownerToken = localStorage.getItem('ownerToken'); // Use ownerToken instead of token

  useEffect(() => {
    if (coffeeShopId && ownerToken) {
      fetchData();
    } else {
      message.error('Coffee shop ID or owner token not found');
      handleOwnerLogout(); // Logout if essential data is missing
    }
  }, [coffeeShopId, ownerToken]);

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.name);
    navigate(item.path);
  };

  const onLogout = () => {
    handleOwnerLogout();
    navigate('/admin-login');
  };

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${ownerToken}` }
      };

      const categoriesResponse = await axios.get(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-categories/`, config);
      const itemsResponse = await axios.get(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/`, config);
      const promosResponse = await axios.get(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/promos/`, config);

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

  const showModal = (type, record = null) => {
    setModalType(type);
    setIsModalVisible(true);
    if (record) {
      if (type === 'item') {
        // Prepare the form data for items, including sizes and image
        const formData = {
          ...record,
          sizes: record.sizes.map(size => ({
            size: size.size,
            price: size.price
          })),
          image: record.image ? [{ uid: '-1', name: 'image.png', status: 'done', url: record.image }] : []
        };
        form.setFieldsValue(formData);
      } else {
        form.setFieldsValue(record);
      }
    } else {
      form.resetFields();
    }
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      handleSubmit(values);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
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
      } else if (key === 'image') {
        if (values[key] && values[key][0] && values[key][0].originFileObj) {
          formData.append(key, values[key][0].originFileObj);
        }
      } else {
        formData.append(key, values[key]);
      }
    }

      let response;
      if (modalType === 'category') {
        const endpoint = values.id 
          ? `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-categories/${values.id}/`
          : `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-categories/`;
        response = values.id 
          ? await axios.put(endpoint, formData, config)
          : await axios.post(endpoint, formData, config);
      } else if (modalType === 'item') {
        const endpoint = values.id 
          ? `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/${values.id}/`
          : `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/`;
        response = values.id 
          ? await axios.put(endpoint, formData, config)
          : await axios.post(endpoint, formData, config);
      } else if (modalType === 'promo') {
        const endpoint = values.id 
          ? `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/promos/${values.id}/`
          : `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/promos/`;
        response = values.id 
          ? await axios.put(endpoint, formData, config)
          : await axios.post(endpoint, formData, config);
      }

      message.success('Operation successful');
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error submitting data:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      if (error.response && error.response.status === 401) {
        message.error('Owner authentication failed. Please log in again.');
        handleOwnerLogout();
      } else {
        message.error('Operation failed: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const handleDelete = async (type, id) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${ownerToken}` }
      };

      if (type === 'category') {
        await axios.delete(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-categories/${id}/`, config);
      } else if (type === 'item') {
        await axios.delete(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/${id}/`, config);
      } else if (type === 'promo') {
        await axios.delete(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/promos/${id}/`, config);
      }
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
  };

  const categoryColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        isEditMode && (
          <>
            <Button icon={<EditOutlined />} onClick={() => showModal('category', record)} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete('category', record.id)} danger />
          </>
        )
      ),
    },
  ];

  const itemColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Category', dataIndex: ['category', 'name'], key: 'category' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        isEditMode && (
          <>
            <Button icon={<EditOutlined />} onClick={() => showModal('item', record)} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete('item', record.id)} danger />
          </>
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
          <>
            <Button icon={<EditOutlined />} onClick={() => showModal('promo', record)} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete('promo', record.id)} danger />
          </>
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
    <div>
      
      <h1>Menu Management</h1>
      <Button onClick={() => setIsEditMode(!isEditMode)}>
        {isEditMode ? 'View Mode' : 'Edit Mode'}
      </Button>
      <h2>Categories</h2>
      <Table dataSource={categories} columns={categoryColumns} />
      {isEditMode && <Button icon={<PlusOutlined />} onClick={() => showModal('category')}>Add Category</Button>}

      <h2>Menu Items</h2>
      <Table dataSource={items} columns={itemColumns} />
      {isEditMode && <Button icon={<PlusOutlined />} onClick={() => showModal('item')}>Add Item</Button>}

      <h2>Promos</h2>
      <Table dataSource={promos} columns={promoColumns} />
      {isEditMode && <Button icon={<PlusOutlined />} onClick={() => showModal('promo')}>Add Promo</Button>}

      <Modal
        title={`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} Form`}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
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
              <Form.List name="sizes">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Form.Item key={key} label={`Size ${name + 1}`} required={false}>
                        <Space.Compact>
                          <Form.Item
                            {...restField}
                            name={[name, 'size']}
                            rules={[{ required: true, message: 'Missing size' }]}
                          >
                            <Input placeholder="Size" style={{ width: '120px' }} />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'price']}
                            rules={[{ required: true, message: 'Missing price' }]}
                          >
                            <Input placeholder="Price" style={{ width: '120px' }} />
                          </Form.Item>
                          <Button onClick={() => remove(name)} type="text" danger>Delete</Button>
                        </Space.Compact>
                      </Form.Item>
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