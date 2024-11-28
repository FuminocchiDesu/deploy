import React from 'react';
import { Modal, Card, Typography, Divider, Image, Space, Tag } from 'antd';
import { formatTime } from './CustomTimePicker';

const { Title, Text } = Typography;

const PreviewContent = ({ modalType, formData, categories }) => {
  const styles = {
    section: {
      marginBottom: '24px',
    },
    label: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '4px',
    },
    value: {
      fontSize: '16px',
      marginBottom: '16px',
    },
    imagesContainer: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginTop: '8px',
    },
    imagePreview: {
      width: '100px',
      height: '100px',
      objectFit: 'cover',
      borderRadius: '4px',
    },
    priceContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #f0f0f0',
    },
    lastPriceContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
    },
    noPricing: {
      color: '#999',
      fontStyle: 'italic',
    }
  };
  const getCategoryName = (categoryId) => {
    const category = categories?.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const renderPricingSection = () => {
    // Check if using main price (explicitly true)
    if (formData.useMainPrice === true) {
      return (
        <Card size="small">
          <div style={styles.lastPriceContainer}>
            <Text>Regular Price</Text>
            <Text strong>₱{parseFloat(formData.price || 0).toLocaleString()}</Text>
          </div>
        </Card>
      );
    }

    // Check for sizes array from the parent component's state
    const sizesData = formData.sizes || [];
    
    if (sizesData.length > 0) {
      return (
        <Card size="small">
          {sizesData.map((size, index) => (
            <div 
              key={index} 
              style={index === sizesData.length - 1 ? styles.lastPriceContainer : styles.priceContainer}
            >
              <Text>{size.size}</Text>
              <Text strong>₱{parseFloat(size.price || 0).toLocaleString()}</Text>
            </div>
          ))}
        </Card>
      );
    }

    // If no pricing information is available
    return (
      <div style={styles.noPricing}>
        {formData.useMainPrice === null ? 'Loading pricing information...' : 'No pricing information available'}
      </div>
    );
  };

  const renderItemPreview = () => (
    <div>
      <div style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <div style={styles.value}>{getCategoryName(formData.category)}</div>

        <Text style={styles.label}>Name</Text>
        <div style={styles.value}>{formData.name}</div>

        {formData.description && (
          <>
            <Text style={styles.label}>Description</Text>
            <div style={styles.value}>{formData.description}</div>
          </>
        )}

        <Text style={styles.label}>Pricing</Text>
        {renderPricingSection()}
      </div>

      {formData.image?.length > 0 && (
        <div style={styles.section}>
          <Text style={styles.label}>Primary Image</Text>
          <div style={styles.imagesContainer}>
            {formData.image.map((img, index) => (
              <Image
                key={index}
                src={img.url || (img.originFileObj ? URL.createObjectURL(img.originFileObj) : img)}
                style={styles.imagePreview}
                alt="Primary"
              />
            ))}
          </div>
        </div>
      )}

      {formData.additional_images?.length > 0 && (
        <div style={styles.section}>
          <Text style={styles.label}>Additional Images</Text>
          <div style={styles.imagesContainer}>
            {formData.additional_images.map((img, index) => (
              <Image
                key={index}
                src={img.url || (img.originFileObj ? URL.createObjectURL(img.originFileObj) : img)}
                style={styles.imagePreview}
                alt={`Additional ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCategoryPreview = () => (
    <div style={styles.section}>
      <Text style={styles.label}>Category Name</Text>
      <div style={styles.value}>{formData.name}</div>

      {formData.description && (
        <>
          <Text style={styles.label}>Description</Text>
          <div style={styles.value}>{formData.description}</div>
        </>
      )}
    </div>
  );
  
  const renderPromoPreview = () => {
    const formatDays = (days) => {
      if (!days || days.length === 0) return 'All days';
      
      const dayMap = {
        'MON': 'Monday', 'TUE': 'Tuesday', 'WED': 'Wednesday',
        'THU': 'Thursday', 'FRI': 'Friday', 'SAT': 'Saturday', 'SUN': 'Sunday'
      };
      
      return days.map(day => dayMap[day]).join(', ');
    };
  
    const formatDate = (date) => {
      // Handle both moment and Date objects, or plain date strings
      if (!date) return 'Not specified';
      
      // If it's a moment or Date object, convert to string
      if (date.toDate || date instanceof Date) {
        return (date.toDate ? date.toDate() : date).toLocaleDateString();
      }
      
      // If it's already a string, return it
      return date;
    };
  
    return (
      <div>
        <div style={styles.section}>
          <Text style={styles.label}>Promotion Name</Text>
          <div style={styles.value}>{formData.name}</div>
  
          <Text style={styles.label}>Description</Text>
          <div style={styles.value}>{formData.description}</div>
  
          <Text style={styles.label}>Promotion Period</Text>
          <div style={styles.value}>
            {formatDate(formData.start_date)} - {formatDate(formData.end_date)}
          </div>
          {(formData.days || formData.start_time || formData.end_time) && (
          <div style={styles.section}>
            <Text style={styles.label}>Promotion Days and Hours</Text>
            <div style={styles.value}>
              {formData.days && (
                <div>
                  <strong>Days:</strong> {formatDays(formData.days)}
                </div>
              )}
              {formData.start_time && formData.end_time && (
              <div>
                <strong>Hours:</strong> {formatTime(formData.start_time)} - {formatTime(formData.end_time)}
              </div>
            )}
            </div>
          </div>
        )}
        </div>
  
        {formData.image?.length > 0 && (
          <div style={styles.section}>
            <Text style={styles.label}>Promotion Image</Text>
            <div style={styles.imagesContainer}>
              {formData.image.map((img, index) => (
                <Image
                  key={index}
                  src={img.url || (img.originFileObj ? URL.createObjectURL(img.originFileObj) : img)}
                  style={styles.imagePreview}
                  alt="Promo"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPreview = () => {
    switch (modalType) {
      case 'item':
        return renderItemPreview();
      case 'category':
        return renderCategoryPreview();
      case 'promo':
        return renderPromoPreview();
      default:
        return null;
    }
  };

  return (
    <div>
      <Title level={4}>Preview</Title>
      <Divider />
      {renderPreview()}
    </div>
  );
};

const FormPreviewModal = ({ 
  visible, 
  onCancel, 
  onConfirm, 
  modalType, 
  formData,
  categories 
}) => {
  return (
    <Modal
      title={`Preview ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
      open={visible}
      onCancel={onCancel}
      onOk={onConfirm}
      width={800}
      okText="Confirm"
      cancelText="Back to Edit"
    >
      <PreviewContent modalType={modalType} formData={formData} categories={categories} />
    </Modal>
  );
};

export default FormPreviewModal;