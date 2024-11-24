import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Table, Modal, Form, Space, ConfigProvider, App, Typography, Descriptions, Image, Card, List } from 'antd';
import SidebarMenu from './SideBarMenu';
import MenuManagementForms from './MenuManagementForms';
import './SharedStyles.css';
import {CoffeeLoader} from '../ui/CoffeeLoader';

const API_BASE_URL = 'https://khlcle.pythonanywhere.com';

const MenuPage = ({ handleOwnerLogout }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [promos, setPromos] = useState([]);
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
  const { message: messageApi } = App.useApp();
  const coffeeShopId = localStorage.getItem('coffeeShopId');
  const ownerToken = localStorage.getItem('ownerToken');
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryPageSize, setCategoryPageSize] = useState(5);
  const [itemPage, setItemPage] = useState(1);
  const [itemPageSize, setItemPageSize] = useState(5);
  const [promoPage, setPromoPage] = useState(1);
  const [promoPageSize, setPromoPageSize] = useState(5);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (coffeeShopId && ownerToken) {
      fetchData();
    } else {
      messageApi.error('Coffee shop ID or owner token not found');
      handleOwnerLogout();
      navigate('/admin-login');
    }
  }, [coffeeShopId, ownerToken]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      setError(null);
      const config = {
        headers: { Authorization: `Bearer ${ownerToken}` }
      };

      const [categoriesResponse, itemsResponse, promosResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-categories/`, config),
        fetch(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/`, config),
        fetch(`${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/promos/`, config)
      ]);

      // Check if responses are ok before trying to parse JSON
      if (!categoriesResponse.ok || !itemsResponse.ok || !promosResponse.ok) {
        throw new Error('One or more API requests failed');
      }

      const [categoriesData, itemsData, promosData] = await Promise.all([
        categoriesResponse.json(),
        itemsResponse.json(),
        promosResponse.json()
      ]);

      // Ensure we're setting arrays, with fallbacks if the API returns null or undefined
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setPromos(Array.isArray(promosData) ? promosData : []);

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(2000 - elapsedTime, 0);
        // Keep showing loader for remaining time
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch menu data');
      messageApi.error('Failed to fetch menu data');
      // Initialize with empty arrays on error
      setCategories([]);
      setItems([]);
      setPromos([]);
      handleOwnerLogout();
      navigate('/admin-login');
      if (error.response?.status === 401) {
        messageApi.error('Owner authentication failed. Please log in again.');
        onLogout();
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

  const handleChange = (pagination, filters, sorter, extra) => {
    setFilteredInfo(filters);
    setSortedInfo({
      columnKey: sorter.columnKey === 'name' ? (
        sorter.field === 'name' ? 'item_name' : (
          sorter.field === 'name' ? 'promo_name' : 'category_name'
        )
      ) : sorter.columnKey,
      order: sorter.order,
    });
  };

  const showModal = (type, record = null) => {
    setModalType(type);
    setSelectedItem(record);
    setIsModalVisible(true);
    if (record) {
      const transformedAdditionalImages = record.additional_images?.map((img, index) => ({
        uid: `existing-${img.id}`,
        name: `image-${index}.jpg`,
        status: 'done',
        url: img.image || img,
        thumbUrl: img.image || img
      })) || [];
  
      const mainImage = record.image ? [{
        uid: 'existing-main',
        name: 'main-image.jpg',
        status: 'done',
        url: record.image,
        thumbUrl: record.image
      }] : [];
  
      // Set useMainPrice based on whether there are sizes or a main price
      const hasMainPrice = record.price && record.price > 0;
      const hasSizes = record.sizes && record.sizes.length > 0;
      setUseMainPrice(hasMainPrice && !hasSizes);
      setSizes(record.sizes || []);
  
      form.setFieldsValue({
        ...record,
        image: mainImage,
        additional_images: transformedAdditionalImages,
        useMainPrice: hasMainPrice && !hasSizes
      });
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
      setError(null);
      const values = await form.validateFields();
      const formData = new FormData();
  
      for (let key in values) {
        if ((key === 'start_date' || key === 'end_date') && values[key]) {
          const dateValue = values[key];
          const formattedDate = dateValue.toISOString 
            ? dateValue.toISOString().split('T')[0]
            : dateValue;
          formData.append(key, formattedDate);
        } else if (key === 'sizes') {
          formData.append(key, JSON.stringify(sizes));
        } else if (key === 'image') {
          if (values[key] && values[key][0] && values[key][0].originFileObj) {
            formData.append(key, values[key][0].originFileObj);
          }
        } else if (key !== 'additional_images' && key !== 'useMainPrice') {
          // Don't append price if using sizes
          if (key === 'price' && !useMainPrice) {
            formData.append('price', '0'); // Set price to 0 when using sizes
          } else {
            formData.append(key, values[key]);
          }
        }
      }
  
      // Special handling for promos
      if (modalType === 'promo') {
        formData.append('coffee_shop', coffeeShopId);
      } else {
        formData.append('is_available', true);
        formData.append('coffee_shop', coffeeShopId);
      }
  
      // Handle item-specific price logic
      if (modalType === 'item') {
        if (useMainPrice) {
          formData.append('price', values.price);
          formData.append('sizes', JSON.stringify([])); // Clear sizes when using main price
        } else {
          formData.append('price', '0'); // Explicitly set price to 0 when using sizes
          formData.append('sizes', JSON.stringify(sizes));
        }
      }
  
      // Handle additional images for items
      if (values.additional_images) {
        values.additional_images.forEach((file) => {
          if (file.originFileObj) {
            formData.append('additional_images', file.originFileObj);
          }
        });
      }
  
      // Determine endpoint based on modal type
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
  
      // Add ID for update operations
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
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }
  
      const responseData = await response.json();
      messageApi.success(`${selectedItem ? 'Update' : 'Create'} successful`);
      handleModalClose();
      setIsPreviewModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(`An error occurred while submitting the form: ${error.message}`);
      messageApi.error('Operation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (type, id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this ' + type + '?',
      content: 'This action cannot be undone. If you are deleting a category it will also delete the items from that category.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          setLoading(true);
          setError(null);
          const config = {
            headers: { Authorization: `Bearer ${ownerToken}` },
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
              throw new Error('Invalid type');
          }
  
          const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: config.headers,
          });
  
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
  
          messageApi.success('Deleted successfully');
          fetchData();
        } catch (error) {
          console.error('Error deleting:', error);
          setError(`An error occurred while deleting: ${error.message}`);
          if (error.response && error.response.status === 401) {
            messageApi.error('Owner authentication failed. Please log in again.');
            handleOwnerLogout();
          } else {
            messageApi.error(`Delete operation failed: ${error.message}`);
          }
        } finally {
          setLoading(false);
        }
      },
      onCancel() {
        messageApi.info('Delete action was canceled');
      },
    });
  };  

  const handleItemDeletion = async ({ 
    itemId, 
    deleteType, 
    additionalId = null,
    coffeeShopId, 
    ownerToken, 
    messageApi, 
    refreshData 
  }) => {
    try {
      let endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/${itemId}`;
      
      // Construct the appropriate endpoint based on deletion type
      switch (deleteType) {
        case 'primary-image':
          endpoint += '/remove-primary-image/';
          break;
        case 'additional-image':
          endpoint += `/remove-additional-image/${additionalId}/`;
          break;
        case 'size':
          endpoint += `/sizes/${additionalId}/`;
          break;
        case 'item':
          // Use base endpoint for full item deletion
          break;
        default:
          throw new Error('Invalid deletion type');
      }
  
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${ownerToken}`
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete: ${errorText}`);
      }
  
      // Show success message
      const messages = {
        'primary-image': 'Primary image removed successfully',
        'additional-image': 'Additional image removed successfully',
        'size': 'Size option removed successfully',
        'item': 'Menu item deleted successfully'
      };
      messageApi.success(messages[deleteType]);
  
      // Refresh data if needed
      if (refreshData) {
        await refreshData();
      }
  
      return true;
    } catch (error) {
      console.error('Delete operation failed:', error);
      messageApi.error(`Failed to delete: ${error.message}`);
      return false;
    }
  };
  
  // Usage functions that can be added to the MenuPage component
  const menuPageDeletionMethods = {
    // Delete entire menu item
    handleDeleteMenuItem: async function(itemId) {
      if (window.confirm('Are you sure you want to delete this menu item?')) {
        return handleItemDeletion({
          itemId,
          deleteType: 'item',
          coffeeShopId: this.coffeeShopId,
          ownerToken: this.ownerToken,
          messageApi: this.messageApi,
          refreshData: this.fetchData
        });
      }
      return false;
    },
  
    // Remove primary image
    handleRemovePrimaryImage: async function(itemId) {
      if (window.confirm('Are you sure you want to remove the primary image?')) {
        return handleItemDeletion({
          itemId,
          deleteType: 'primary-image',
          coffeeShopId: this.coffeeShopId,
          ownerToken: this.ownerToken,
          messageApi: this.messageApi,
          refreshData: this.fetchData
        });
      }
      return false;
    },
  
    // Remove additional image
    handleRemoveAdditionalImage: async function(itemId, imageId) {
      if (window.confirm('Are you sure you want to remove this image?')) {
        return handleItemDeletion({
          itemId,
          deleteType: 'additional-image',
          additionalId: imageId,
          coffeeShopId: this.coffeeShopId,
          ownerToken: this.ownerToken,
          messageApi: this.messageApi,
          refreshData: this.fetchData
        });
      }
      return false;
    },
  
    // Remove size option
    handleRemoveSize: async function(itemId, sizeId) {
      if (window.confirm('Are you sure you want to remove this size option?')) {
        return handleItemDeletion({
          itemId,
          deleteType: 'size',
          additionalId: sizeId,
          coffeeShopId: this.coffeeShopId,
          ownerToken: this.ownerToken,
          messageApi: this.messageApi,
          refreshData: this.fetchData
        });
      }
      return false;
    }
  };

  const handleAvailabilityToggle = async (id, currentAvailability) => {
    try {
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
      messageApi.success('Item availability updated successfully');
    } catch (error) {
      console.error('Error toggling availability:', error);
      setError(`An error occurred while updating availability: ${error.messageApi}`);
      messageApi.error('Failed to update item availability');
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

  const categoryColumns = [
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'category_name',
      width: '80%',
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'category_name' && sortedInfo.order,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => (  
          <Space>
            <Button icon={<EditOutlined />} onClick={() => showModal('category', record)} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete('category', record.id)} danger />
          </Space>
      ),
    },
  ];

  const itemColumns = [
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'item_name',
      width: '20%',
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'item_name' && sortedInfo.order,
    },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description',
      width: '30%',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: '15%',
      ellipsis: true,
      filteredValue: filteredInfo.category || null,
      filters: categories.map(category => ({
        text: category.name,
        value: category.id,
      })),
      onFilter: (value, record) => record.category === value,
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
      filters: [
        { text: 'Available', value: true },
        { text: 'Unavailable', value: false },
      ],
      filteredValue: filteredInfo.is_available || null,
      onFilter: (value, record) => record.is_available === value,
      render: (isAvailable, record) => (
        <Button
          style={{ 
            backgroundColor: isAvailable ? '#717a50' : '#ff4d4f', 
            borderColor: isAvailable ? '#717a50' : '#ff4d4f', 
            color: 'white' 
          }}
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
          <Space>
            <Button icon={<EditOutlined />} onClick={() => showModal('item', record)} />
            <Button icon={<DeleteOutlined />} onClick={() => menuPageDeletionMethods.handleDeleteMenuItem.call({
              coffeeShopId,
              ownerToken,
              messageApi,
              fetchData
            }, record.id)} danger />
          </Space>
      ),
    }
  ];

  const promoColumns = [
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'promo_name',
      width: '20%',
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'promo_name' && sortedInfo.order,
    },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description',
      width: '30%',
      ellipsis: true,
    },
    { 
      title: 'Start Date', 
      dataIndex: 'start_date', 
      key: 'start_date',
      width: '15%',
      filteredValue: filteredInfo.start_date || null,
      filters: Array.from(new Set(promos.map(promo => promo.start_date)))
        .map(date => ({
          text: date,
          value: date,
        })),
      onFilter: (value, record) => record.start_date === value
    },
    { 
      title: 'End Date', 
      dataIndex: 'end_date', 
      key: 'end_date',
      width: '15%',
      filteredValue: filteredInfo.end_date || null,
      filters: Array.from(new Set(promos.map(promo => promo.end_date)))
        .map(date => ({
          text: date,
          value: date,
        })),
      onFilter: (value, record) => record.end_date === value
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => showModal('promo', record)} />
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete('promo', record.id)} danger />
          </Space>
      ),
    },
  ];

  const tableProps = {
    loading: loading,
    scroll: { x: 800 },
    onChange: handleChange, // Add onChange handler to manage filters
  };

  const paginationTheme = {
    token: {
      colorPrimary: '#a0522d',
    },
  };

  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      const previewDataObj = {
        ...values,
        // Format the data for preview
        category: modalType === 'item' ? categories.find(cat => cat.id === values.category)?.name : undefined,
        image: values.image?.[0]?.url || values.image?.[0]?.preview,
        additional_images: values.additional_images?.map(img => img.url || img.preview) || [],
        sizes: modalType === 'item' && !useMainPrice ? sizes : [],
        price: useMainPrice ? values.price : undefined,
      };
      
      setPreviewData(previewDataObj);
      setIsPreviewModalVisible(true);
    } catch (error) {
      console.error('Validation failed:', error);
      messageApi.error('Please fill in all required fields');
    }
  };

  const renderPreviewContent = () => {
    if (!previewData) return null;
    const { Title, Text } = Typography;
  
    const commonImageProps = {
      style: { maxHeight: '200px', objectFit: 'cover' },
      fallback: "data:image/png;base64,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"
    };
  
    switch (modalType) {
      case 'category':
        return (
          <Card>
            <Title level={4}>Category Preview</Title>
            <Descriptions column={1}>
              <Descriptions.Item label="Name">{previewData.name}</Descriptions.Item>
            </Descriptions>
          </Card>
        );
  
      case 'item':
        return (
          <Card>
            <Title level={4}>Item Preview</Title>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <Descriptions column={1}>
                  <Descriptions.Item label="Name">{previewData.name}</Descriptions.Item>
                  <Descriptions.Item label="Category">{previewData.category}</Descriptions.Item>
                  <Descriptions.Item label="Description">{previewData.description}</Descriptions.Item>
                  {useMainPrice ? (
                    <Descriptions.Item label="Price">₱{previewData.price}</Descriptions.Item>
                  ) : (
                    <Descriptions.Item label="Sizes">
                      <List
                        size="small"
                        dataSource={previewData.sizes}
                        renderItem={(size) => (
                          <List.Item>
                            <Text>{size.size}: ₱{size.price}</Text>
                          </List.Item>
                        )}
                      />
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </div>
              <div style={{ flex: 1 }}>
                {previewData.image && (
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Main Image</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Image
                        src={previewData.image}
                        alt="Main"
                        {...commonImageProps}
                      />
                    </div>
                  </div>
                )}
                {previewData.additional_images?.length > 0 && (
                  <div>
                    <Text strong>Additional Images</Text>
                    <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {previewData.additional_images.map((img, index) => (
                        <Image
                          key={index}
                          src={img}
                          alt={`Additional ${index + 1}`}
                          {...commonImageProps}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
  
      case 'promo':
        return (
          <Card>
            <Title level={4}>Promo Preview</Title>
            <Descriptions column={1}>
              <Descriptions.Item label="Name">{previewData.name}</Descriptions.Item>
              <Descriptions.Item label="Description">{previewData.description}</Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {previewData.start_date?.toString()}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {previewData.end_date?.toString()}
              </Descriptions.Item>
            </Descriptions>
            {previewData.image && (
              <div style={{ marginTop: '16px' }}>
                <Text strong>Image</Text>
                <div style={{ marginTop: '8px' }}>
                  <Image
                    src={previewData.image}
                    alt="Promo"
                    {...commonImageProps}
                  />
                </div>
              </div>
            )}
          </Card>
        );
  
      default:
        return null;
    }
  };

  return (
    <div  className="admin-layout">
      <SidebarMenu
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        onLogout={onLogout}
      />
      <div className="main-content">
      {loading ? (
          <div className="loader-container">
            <CoffeeLoader size={80} color="#8B4513" />
          </div>
        ) : (
          <div>
        <h1 className="page-title">Menu Management</h1>  
        <ConfigProvider theme={paginationTheme}>
          <section className="menu-section mb-8">
            <h2 className="text-xl font-semibold  mb-2">Categories</h2>
            {
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('category')} className="mb-2">
                Add Category
              </Button>
            }
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
            {
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('item')} className="mb-2">
                Add Item
              </Button>
            }
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
            {
              <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal('promo')} className="mb-2">
                Add Promo
              </Button>
            }
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
        </ConfigProvider>

        <Modal
        title={`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} Form`}
        open={isModalVisible}
        onOk={handlePreview}
        onCancel={handleModalClose}
        okText="Preview"
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
            handleRemoveAdditionalImage={(itemId, imageId) => 
              menuPageDeletionMethods.handleRemoveAdditionalImage.call({
                coffeeShopId,
                ownerToken,
                messageApi,
                fetchData
              }, itemId, imageId)
            }
            handleRemoveSize={(itemId, sizeId) => 
              menuPageDeletionMethods.handleRemoveSize.call({
                coffeeShopId,
                ownerToken,
                messageApi,
                fetchData
              }, itemId, sizeId)
            }
            selectedItem={selectedItem}
            form={form}
          />
        </Form>
      </Modal>

      <Modal
        title="Preview"
        open={isPreviewModalVisible}
        onOk={handleFormSubmit}
        onCancel={() => setIsPreviewModalVisible(false)}
        width={800}
        okText="Submit"
        cancelText="Back to Edit"
      >
        {renderPreviewContent()}
      </Modal>
      </div>
       )}
      </div>
      
    </div>
  );
};

export default MenuPage;