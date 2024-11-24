import React from 'react';

const FavoritesCard = ({ dashboardData }) => {
  return (
    <div className="settings-form">
      <div className="card-header">
        <h2 className="card-title">Favorites</h2>
      </div>
      <div className="card-content">
        <p className="stat-value">{dashboardData.favorite_count}</p>
        <p className="stat-label">Users have liked your coffee shop</p>
        
        {dashboardData.favorite_users && dashboardData.favorite_users.length > 0 && (
          <div className="favorites-users-section">
            <h3 className="favorites-subtitle">Liked by:</h3>
            <div className="favorites-users-list">
              {dashboardData.favorite_users.map((user, index) => (
                <div key={index} className="favorite-user-item">
                  <img
                    src={user.profile_picture}
                    alt={user.username}
                    className="favorite-user-avatar"
                  />
                  <span className="favorite-user-name">
                    {user.username}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesCard;