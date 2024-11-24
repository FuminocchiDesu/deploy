import React from 'react';
import { Modal, Card, Typography, Divider, Image, Space, Tag } from 'antd';
import { formatDate } from '../utils/formatdate';

const { Title, Text } = Typography;

const PreviewContent = ({ modalType, formData }) => {
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
    }
  };

  const renderItemPreview = () => (
    <div>
      <div style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <div style={styles.value}>{formData.category}</div>

        <Text style={styles.label}>Name</Text>
        <div style={styles.value}>{formData.name}</div>

        {formData.description && (
          <>
            <Text style={styles.label}>Description</Text>
            <div style={styles.value}>{formData.description}</div>
          </>
        )}

        <Text style={styles.label}>Pricing</Text>
        {formData.useMainPrice ? (
          <div style={styles.value}>₱{formData.price}</div>
        ) : (
          <Card size="small">
            {formData.sizes?.map((size, index) => (
              <div key={index} style={styles.priceContainer}>
                <Text>{size.size}</Text>
                <Text>₱{size.price}</Text>
              </div>
            ))}
          </Card>
        )}
      </div>

      {formData.image?.length > 0 && (
        <div style={styles.section}>
          <Text style={styles.label}>Primary Image</Text>
          <div style={styles.imagesContainer}>
            {formData.image.map((img, index) => (
              <Image
                key={index}
                src={img.url || URL.createObjectURL(img.originFileObj)}
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
                src={img.url || URL.createObjectURL(img.originFileObj)}
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
    </div>
  );

  const renderPromoPreview = () => (
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
      </div>

      {formData.image?.length > 0 && (
        <div style={styles.section}>
          <Text style={styles.label}>Promotion Image</Text>
          <div style={styles.imagesContainer}>
            {formData.image.map((img, index) => (
              <Image
                key={index}
                src={img.url || URL.createObjectURL(img.originFileObj)}
                style={styles.imagePreview}
                alt="Promo"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

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
  formData 
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
      <PreviewContent modalType={modalType} formData={formData} />
    </Modal>
  );
};

export default FormPreviewModal;