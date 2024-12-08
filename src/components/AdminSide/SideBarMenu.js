import React, { useState } from 'react';
import { Coffee, Home, LogOut, Edit, User, Star, Bell, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal } from 'antd';

const SidebarMenu = ({ 
  activeMenuItem, 
  handleMenuItemClick, 
  onLogout, 
  notifications, 
  clearNotifications, 
  markNotificationAsRead,
  coffeeShopName = 'Coffee Shop Dashboard'
}) => {
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <Home className="menu-icon" />, path: '/dashboard' },
    { name: 'Menu', icon: <Coffee className="menu-icon" />, path: '/dashboard/menu' },
    { name: 'Reviews', icon: <Star className="menu-icon" />, path: '/dashboard/reviews' },
    { name: 'Edit Page', icon: <Edit className="menu-icon" />, path: '/dashboard/page-settings' },
  ];

  const handleNotificationClick = () => {
    setIsNotificationModalVisible(true);
  };

  const handleNotificationItemClick = (promo) => {
    setIsNotificationModalVisible(false);
    markNotificationAsRead(promo.id);
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
          <span className="admin-title">{coffeeShopName}</span>
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
            className="clearbutton"
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
                  className="notifcontents"
                  onClick={() => handleNotificationItemClick(promo)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{promo.name}</h3>
                      <p className="text-sm text-gray-600">
                        Ending in {daysUntilEnd} day{daysUntilEnd !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="viewdetails">
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