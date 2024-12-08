import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, App } from 'antd';
import SidebarMenu from './SideBarMenu';
import MenuManagementForms from './MenuManagementForms';
import MenuTables from './MenuTables';
import './SharedStyles.css';
import {CoffeeLoader} from '../ui/CoffeeLoader';
import FormPreviewModal from './FormPreviewModal';

const API_BASE_URL = 'https://khlcle.pythonanywhere.com';

const MenuPage = ({ handleOwnerLogout, 
  notifications = [], 
  clearNotifications = () => {}, 
  markNotificationAsRead = () => {},
  coffeeShopName = 'Coffee Shop Dashboard'
}) => {
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
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
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
      const values = await form.validateFields();
      
      // Prepare preview data
      const formattedData = {
        ...values,
        sizes: !values.useMainPrice ? sizes : [],
        useMainPrice: Boolean(values.useMainPrice),
        // Handle image previews
        image: values.image?.map(file => ({
          url: file.originFileObj ? URL.createObjectURL(file.originFileObj) : file.url,
          ...file
        })),
        additional_images: values.additional_images?.map(file => ({
          url: file.originFileObj ? URL.createObjectURL(file.originFileObj) : file.url,
          ...file
        })),
        days: values.days || [],
        // Directly use the string time values
        start_time: values.start_time,
        end_time: values.end_time,
      };
  
      // Set preview data and show modal
      setPreviewData(formattedData);
      setIsPreviewVisible(true);
    } catch (error) {
      console.error('Form validation failed:', error);
      messageApi.error('Please fill in all required fields');
    }
  };

  const handlePreviewCancel = () => {
    setIsPreviewVisible(false);
    setPreviewData(null);
  };

  const handlePreviewConfirm = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const formData = new FormData();
  
      for (let key in values) {
        if ((key === 'start_date' || key === 'end_date') && values[key]) {
          const dateValue = values[key];
          const formattedDate = dateValue.toISOString 
            ? dateValue.toISOString().split('T')[0]
            : dateValue;
          formData.append(key, formattedDate);
        } else if ((key === 'start_time' || key === 'end_time') && values[key]) {
          // Ensure 24-hour format
          const [hour, minute, period] = [
            values[key].split(':')[0], 
            values[key].split(':')[1], 
            values[key].includes('PM')
          ];
          
          let formattedHour = parseInt(hour);
          if (period && formattedHour !== 12) {
            formattedHour += 12;
          }
          if (!period && formattedHour === 12) {
            formattedHour = 0;
          }
          
          const formattedTime = `${formattedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          formData.append(key, formattedTime);
        } else if (key === 'days') {
          // Explicitly handle days as JSON or empty array
          formData.append(key, JSON.stringify(values.days || []));
        } else if (key === 'image') {
          if (values[key] && values[key][0] && values[key][0].originFileObj) {
            formData.append(key, values[key][0].originFileObj);
          }
        } else if (values[key] !== undefined && key !== 'useMainPrice') {
          formData.append(key, values[key]);
        }
      }
  
      // IMPORTANT: Explicitly check if times are undefined
      if (!values.start_time) {
        formData.delete('start_time');
      }
      if (!values.end_time) {
        formData.delete('end_time');
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
      setIsPreviewVisible(false);
      setPreviewData(null);
      handleModalClose();
      fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Only show error message if it's not a validation error
      if (!(error instanceof Error && error.message.startsWith('Missing required field'))) {
        messageApi.error('Operation failed: ' + error.message);
      }
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

  const handleDeleteMenuItem = (itemId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this menu item?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          setLoading(true);
          const config = {
            headers: { Authorization: `Bearer ${ownerToken}` },
          };
    
          const endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/${itemId}/`;
    
          const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: config.headers,
          });
    
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          }
    
          messageApi.success('Menu item deleted successfully');
          fetchData();
        } catch (error) {
          console.error('Error deleting menu item:', error);
          messageApi.error(`Delete operation failed: ${error.message}`);
        } finally {
          setLoading(false);
        }
      },
      onCancel() {
        messageApi.info('Delete action was canceled');
      },
    });
  };

  const menuPageDeletionMethods = {
    handleDeleteMenuItem,
    handleRemovePrimaryImage: (itemId) => {
      Modal.confirm({
        title: 'Are you sure you want to remove the primary image?',
        content: 'This action cannot be undone.',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            const endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/${itemId}/remove-primary-image/`;
            
            const response = await fetch(endpoint, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${ownerToken}` }
            });
    
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to delete: ${errorText}`);
            }
    
            messageApi.success('Primary image removed successfully');
            fetchData();
            return true;
          } catch (error) {
            console.error('Delete operation failed:', error);
            messageApi.error(`Failed to delete: ${error.message}`);
            return false;
          }
        }
      });
    },
    
    handleRemoveAdditionalImage: (itemId, imageId) => {
      Modal.confirm({
        title: 'Are you sure you want to remove this image?',
        content: 'This action cannot be undone.',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            const endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/${itemId}/remove-additional-image/${imageId}/`;
            
            const response = await fetch(endpoint, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${ownerToken}` }
            });
    
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to delete: ${errorText}`);
            }
    
            messageApi.success('Additional image removed successfully');
            fetchData();
            return true;
          } catch (error) {
            console.error('Delete operation failed:', error);
            messageApi.error(`Failed to delete: ${error.message}`);
            return false;
          }
        }
      });
    },
    
    handleRemoveSize: (itemId, sizeId) => {
      Modal.confirm({
        title: 'Are you sure you want to remove this size option?',
        content: 'This action cannot be undone.',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            const endpoint = `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/menu-items/${itemId}/sizes/${sizeId}/`;
            
            const response = await fetch(endpoint, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${ownerToken}` }
            });
    
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to delete: ${errorText}`);
            }
    
            messageApi.success('Size option removed successfully');
            fetchData();
            return true;
          } catch (error) {
            console.error('Delete operation failed:', error);
            messageApi.error(`Failed to delete: ${error.message}`);
            return false;
          }
        }
      });
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

  return (
    <div  className="admin-layout">
      <SidebarMenu
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        onLogout={onLogout}
        notifications={notifications}
        clearNotifications={clearNotifications}
        markNotificationAsRead={markNotificationAsRead}
        coffeeShopName={coffeeShopName}
      />
      <div className="main-content">
      {loading ? (
          <div className="loader-container">
            <CoffeeLoader 
            size={80} 
            cupColor="#B5651D" 
            steamColor="#D2B48C" 
            saucerColor="#A0522D" 
          />
          </div>
        ) : (
          <div>
        <h1 className="page-title">Menu Management</h1>  
        <MenuTables
              loading={loading}
              categories={categories}
              items={items}
              promos={promos}
              handleChange={handleChange}
              showModal={showModal}
              handleDelete={handleDelete}
              handleAvailabilityToggle={handleAvailabilityToggle}
              menuPageDeletionMethods={menuPageDeletionMethods}
              filteredInfo={filteredInfo}
              sortedInfo={sortedInfo}
              pagination={{
                categoryPage,
                categoryPageSize,
                setCategoryPage,
                setCategoryPageSize,
                itemPage,
                itemPageSize,
                setItemPage,
                setItemPageSize,
                promoPage,
                promoPageSize,
                setPromoPage,
                setPromoPageSize,
              }}
            />

    <Modal
        title={`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} Form`}
        open={isModalVisible}
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

      {/* Add FormPreviewModal */}
      <FormPreviewModal
        visible={isPreviewVisible}
        onCancel={handlePreviewCancel}
        onConfirm={handlePreviewConfirm}
        modalType={modalType}
        formData={previewData}
        categories={categories}
      />
    </div>
       )}
      </div>
      
    </div>
  );
};

export default MenuPage;