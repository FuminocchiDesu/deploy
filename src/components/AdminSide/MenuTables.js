import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Table, ConfigProvider, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { formatTime } from './CustomTimePicker';

const MenuTables = ({
  loading,
  categories,
  items,
  promos,
  handleChange,
  showModal,
  handleDelete,
  handleAvailabilityToggle,
  menuPageDeletionMethods,
  filteredInfo,
  sortedInfo,
  pagination: {
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
  }
}) => {
  const location = useLocation();
  const [highlightedPromoId, setHighlightedPromoId] = useState(null);

  const scrollToPromo = useCallback(() => {
    // Use a slight delay to ensure DOM is fully rendered
    setTimeout(() => {
      const promoRow = document.querySelector(`[data-promo-id="${highlightedPromoId}"]`);
      
      if (promoRow) {
        // Scroll to the row and center it
        promoRow.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  }, [highlightedPromoId]);

  useEffect(() => {
    // Check if we're navigating from notification and should highlight a promo
    const highlightPromoId = location.state?.highlightPromoId;
    const shouldScrollToPromo = location.state?.scrollToPromo;

    if (highlightPromoId) {
      setHighlightedPromoId(highlightPromoId);

      // Clear the state to prevent re-highlighting on subsequent renders
      window.history.replaceState(null, '', location.pathname);

      // Scroll to the promo if requested
      if (shouldScrollToPromo) {
        scrollToPromo();
      }
    }
  }, [location.state, promos, scrollToPromo]);

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
      align: 'center',
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
      align: 'center',
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
      align: 'center',
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
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal('item', record)} />
          <Button icon={<DeleteOutlined />} onClick={() => menuPageDeletionMethods.handleDeleteMenuItem(record.id)} danger />
        </Space>
      ),
    }
  ];

  const promoColumns = [
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'promo_name',
      width: '10%',
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'promo_name' && sortedInfo.order,
      render: (name, record) => (
        <div 
          data-promo-id={record.id}
          className={`promo-name ${highlightedPromoId === record.id ? 'highlighted-promo' : ''}`}
        >
          {name}
        </div>
      )
    },
    { 
      title: 'Description', 
      dataIndex: 'description', 
      key: 'description',
      width: '20%',
      ellipsis: true,
    },
    { 
      title: 'Start Date', 
      dataIndex: 'start_date', 
      key: 'start_date',
      width: '10%',
      align: 'center',
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
      width: '10%',
      align: 'center',
      filteredValue: filteredInfo.end_date || null,
      filters: Array.from(new Set(promos.map(promo => promo.end_date)))
        .map(date => ({
          text: date,
          value: date,
        })),
      onFilter: (value, record) => record.end_date === value
    },
    { 
      title: 'Days', 
      dataIndex: 'days', 
      key: 'days',
      width: '15%',
      render: (days) => {
        if (!days || days.length === 0) return 'All Days';
        
        const dayMap = {
          'MON': 'Mon', 'TUE': 'Tue', 'WED': 'Wed',
          'THU': 'Thu', 'FRI': 'Fri', 'SAT': 'Sat', 'SUN': 'Sun'
        };
        
        return days.map(day => dayMap[day]).join(', ');
      }
    },
    { 
      title: 'Hours', 
      key: 'hours',
      width: '15%',
      render: (_, record) => {
        if (!record.start_time || !record.end_time) return 'All Hours';
        return `${formatTime(record.start_time)} - ${formatTime(record.end_time)}`;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      align: 'center',
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
    onChange: handleChange,
  };

  const paginationTheme = {
    token: {
      colorPrimary: '#a0522d',
    },
  };

  return (
    <ConfigProvider theme={paginationTheme}>
      <section className="menu-section mb-8">
        <div className="menu-section-header">
          <h2 className="text-xl font-semibold">Categories</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal('category')} 
            id="buttons-design"
          >
            Add Category
          </Button>
        </div>
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
        <div className="menu-section-header">
          <h2 className="text-xl font-semibold">Menu Items</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal('item')} 
            id="buttons-design"
          >
            Add Item
          </Button>
        </div>
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
        <div className="menu-section-header">
          <h2 className="text-xl font-semibold">Promos</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal('promo')} 
            id="buttons-design"
          >
            Add Promo
          </Button>
        </div>
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
  );
};

export default MenuTables;