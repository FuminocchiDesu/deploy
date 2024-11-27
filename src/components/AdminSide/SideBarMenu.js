import React, { useState, useEffect } from 'react';
import { Coffee, Home, LogOut, Edit, User, Star, Bell, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, App } from 'antd';

const API_BASE_URL = 'https://khlcle.pythonanywhere.com';

const SidebarMenu = ({ activeMenuItem, handleMenuItemClick, onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();

  const coffeeShopId = localStorage.getItem('coffeeShopId');
  const ownerToken = localStorage.getItem('ownerToken');

  const menuItems = [
    { name: 'Dashboard', icon: <Home className="menu-icon" />, path: '/dashboard' },
    { name: 'Menu', icon: <Coffee className="menu-icon" />, path: '/dashboard/menu' },
    { name: 'Reviews', icon: <Star className="menu-icon" />, path: '/dashboard/reviews' },
    { name: 'Edit Page', icon: <Edit className="menu-icon" />, path: '/dashboard/page-settings' },
  ];

  useEffect(() => {
    if (coffeeShopId && ownerToken) {
      fetchPromos();
    }
  }, [coffeeShopId, ownerToken]);

  const fetchPromos = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${ownerToken}` }
      };

      const response = await fetch(
        `${API_BASE_URL}/api/coffee-shops/${coffeeShopId}/promos/`, 
        config
      );

      if (!response.ok) {
        throw new Error('Failed to fetch promos');
      }

      const promosData = await response.json();
      processPromoNotifications(promosData);
    } catch (error) {
      console.error('Error fetching promos:', error);
      messageApi.error('Failed to fetch promo notifications');
    }
  };

  const processPromoNotifications = (promos) => {
    const nearEndPromos = promos.filter(checkPromoNearEndDate);
    setNotifications(nearEndPromos);

    if (nearEndPromos.length > 0) {
      nearEndPromos.forEach(promo => {
        const endDate = new Date(promo.end_date);
        const daysUntilEnd = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
        
        messageApi.warning({
          content: `Promo "${promo.name}" is ending in ${daysUntilEnd} day${daysUntilEnd !== 1 ? 's' : ''}!`,
          duration: 2,
          key: `promo-${promo.id}`,
        });
      });
    }
  };

  const checkPromoNearEndDate = (promo) => {
    if (!promo.end_date) return false;

    const endDate = new Date(promo.end_date);
    const today = new Date();
    
    const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    return daysUntilEnd > 0 && daysUntilEnd <= 3;
  };

  const handleNotificationClick = () => {
    setIsNotificationModalVisible(true);
  };

  const handleNotificationItemClick = (promo) => {
    setIsNotificationModalVisible(false);
    navigate('/dashboard/menu', { 
      state: { 
        highlightPromoId: promo.id,
        scrollToPromo: true 
      } 
    });
  };

  const handleCloseNotificationModal = () => {
    setIsNotificationModalVisible(false);
  };

  const clearNotifications = () => {
    setNotifications([]);
    notifications.forEach(promo => {
      messageApi.destroy(`promo-${promo.id}`);
    });
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link 
            to="/dashboard/profile" 
            className="user-profile-link"
          >
            <User className="menu-icon" />
          </Link>
          <div className="header-content">
            <span className="admin-title">Coffee Shop Dashboard</span>
            <div className="notification-container">
              <button 
                className="notification-icon" 
                onClick={handleNotificationClick}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="notification-badge">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`menu-item ${activeMenuItem === item.name ? 'active' : ''}`}
              onClick={() => handleMenuItemClick(item)}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <button className="logout-button" onClick={onLogout}>
          <LogOut className="menu-icon" />
          <span>Logout</span>
        </button>
      </aside>

      <Modal
        title="Promo Notifications"
        open={isNotificationModalVisible}
        onCancel={handleCloseNotificationModal}
        footer={[
          <button 
            type="button" 
            className="ant-btn css-dev-only-do-not-override-1a6v4c6 ant-btn-primary ant-btn-color-primary ant-btn-variant-solid"
            onClick={clearNotifications}
          >
            <XCircle className="inline-block mr-2" /> Clear All
          </button>
        ]}
      >
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500">No notifications</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((promo) => {
              const endDate = new Date(promo.end_date);
              const today = new Date();
              const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

              return (
                <div 
                  key={promo.id} 
                  className="border p-4 rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleNotificationItemClick(promo)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{promo.name}</h3>
                      <p className="text-sm text-gray-600">
                        Ending in {daysUntilEnd} day{daysUntilEnd !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="text-red-500 font-semibold">
                      View Details
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </>
  );
};

export default SidebarMenu;