import React from 'react';
import { Form, Input, Select, Upload, Button, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import CustomTimePicker, { formatTime } from './CustomTimePicker';
import DatePicker from './DatePicker';

const MenuManagementForms = ({
  modalType,
  categories,
  useMainPrice,
  setUseMainPrice,
  sizes,
  handleSizeChange,
  addSize,
  removeSize,
  handleAdditionalImagesPreview,
  handleRemoveAdditionalImage,
  handleRemoveSize,
  selectedItem,
  form
}) => {
  const formStyles = {
    container: {
      padding: '24px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      maxWidth: '600px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '24px',
      borderBottom: '1px solid #eee',
      paddingBottom: '16px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 600,
      color: '#111',
      marginBottom: '8px',
    },
    description: {
      color: '#666',
      fontSize: '14px',
    },
    section: {
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 500,
      color: '#333',
      marginBottom: '12px',
    },
    inputGroup: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: 500,
      color: '#444',
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'border-color 0.2s',
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      minHeight: '100px',
      fontSize: '14px',
    },
    select: {
      width: '100%',
    },
    uploadSection: {
      marginTop: '16px',
      padding: '16px',
      backgroundColor: '#f9f9f9',
      borderRadius: '6px',
    },
    sizesContainer: {
      backgroundColor: '#f9f9f9',
      padding: '16px',
      borderRadius: '6px',
      marginTop: '16px',
    },
    sizeRow: {
      display: 'flex',
      gap: '12px',
      marginBottom: '12px',
      alignItems: 'center',
    },
    addButton: {
      marginTop: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: '#1890ff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    deleteButton: {
      padding: '4px 8px',
      backgroundColor: '#ff4d4f',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    }
  };
  const handleImageRemove = async (file) => {
    if (selectedItem) {
      if (file.uid && file.uid.startsWith('existing-')) {
        // This is an existing image
        const imageId = file.uid.replace('existing-', '');
        const success = await handleRemoveAdditionalImage(selectedItem.id, imageId);
        if (success) {
          // Remove from form
          const currentImages = form.getFieldValue('additional_images') || [];
          form.setFieldsValue({
            additional_images: currentImages.filter(img => img.uid !== file.uid)
          });
        }
        return false; // Prevent default Upload removal
      }
    }
    return true; // Allow removal of newly added images
  };

  const handlePrimaryImageRemove = async (file) => {
    if (selectedItem && file.url) {
      // This is an existing primary image
      const currentImages = form.getFieldValue('image') || [];
      form.setFieldsValue({
        image: []
      });
      return false; // Prevent default Upload removal
    }
    return true; // Allow removal of newly added images
  };
  const renderItemForm = () => (
    <div style={formStyles.container}>
      <div style={formStyles.header}>
        <h2 style={formStyles.title}>Menu Item Details</h2>
        <p style={formStyles.description}>Add or edit menu item information</p>
      </div>

      <div style={formStyles.section}>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select style={formStyles.select}>
            {categories.map(category => (
              <Select.Option key={category.id} value={category.id}>{category.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="name" label="Item Name" rules={[{ required: true }]}>
          <Input style={formStyles.input} />
        </Form.Item>
        <Form.Item name="description" label="Description" initialValue="">
          <Input.TextArea style={formStyles.textarea} />
        </Form.Item>
      </div>

      <div style={formStyles.section}>
        <h3 style={formStyles.sectionTitle}>Images</h3>
        <Form.Item 
          name="image" 
          label="Primary Image" 
          valuePropName="fileList"
          getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
        >
          <Upload 
          beforeUpload={() => false}
          listType="picture-card"
          maxCount={1}
          accept="image/*"
          onRemove={handlePrimaryImageRemove}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>

        <Form.Item 
          name="additional_images" 
          label="Additional Images"
          valuePropName="fileList"
          getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
        >
          <Upload
            beforeUpload={() => false}
            listType="picture-card"
            multiple={true}
            accept="image/*"
            onPreview={handleAdditionalImagesPreview}
            onRemove={handleImageRemove}
            style={formStyles.uploadSection}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Additional Images</div>
            </div>
          </Upload>
        </Form.Item>
      </div>

      <div style={formStyles.section}>
        <h3 style={formStyles.sectionTitle}>Pricing</h3>
        <Form.Item name="useMainPrice" valuePropName="checked">
          <Checkbox onChange={(e) => setUseMainPrice(e.target.checked)}>
            Use main price (no sizes)
          </Checkbox>
        </Form.Item>
        
        {useMainPrice ? (
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <Input type="number" step="0.01" style={formStyles.input} />
          </Form.Item>
        ) : (
          <div style={formStyles.sizesContainer}>
            <label style={formStyles.label}>Sizes and Prices</label>
            {sizes.map((size, index) => (
              <div key={index} style={formStyles.sizeRow}>
                <Input
                  value={size.size}
                  onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                  placeholder="Size"
                  style={{ ...formStyles.input, width: '40%' }}
                />
                <Input
                  type="number"
                  value={size.price}
                  onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                  placeholder="Price"
                  step="0.01"
                  style={{ ...formStyles.input, width: '40%' }}
                />
                <Button 
                  onClick={() => {
                    if (size.id && selectedItem) {
                      handleRemoveSize(selectedItem.id, size.id);
                    } else {
                      removeSize(index);
                    }
                  }} 
                  style={formStyles.deleteButton}
                >
                  <DeleteOutlined />
                </Button>
              </div>
            ))}
            <Button 
              type="dashed" 
              onClick={addSize} 
              style={{
                ...formStyles.addButton,
                backgroundColor: '#a0522d' // Changed from '#1890ff' to '#a0522d'
              }}
            >
              <PlusOutlined /> Add Size
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCategoryForm = () => (
    <div style={formStyles.container}>
      <div style={formStyles.header}>
        <h2 style={formStyles.title}>Category Details</h2>
        <p style={formStyles.description}>Add or edit category information</p>
      </div>
      
      <Form.Item 
        name="name" 
        label={<span>Category Name {<span style={{ color: '#ff4d4f' }}>*</span>}</span>}
        rules={[{ required: true }]}
        required={false}
      >
        <Input style={formStyles.input} />
      </Form.Item>
    </div>
  );

  const renderPromoForm = () => {
    const daysOfWeek = [
      { label: 'Monday', value: 'MON' },
      { label: 'Tuesday', value: 'TUE' },
      { label: 'Wednesday', value: 'WED' },
      { label: 'Thursday', value: 'THU' },
      { label: 'Friday', value: 'FRI' },
      { label: 'Saturday', value: 'SAT' },
      { label: 'Sunday', value: 'SUN' },
    ];
  
    return (
    <div style={formStyles.container}>
      <div style={formStyles.header}>
        <h2 style={formStyles.title}>Promotion Details</h2>
        <p style={formStyles.description}>Add or edit promotion information</p>
      </div>

      <div style={formStyles.section}>
        <Form.Item 
        name="name" 
        label={<span>Promo Name {<span style={{ color: '#ff4d4f' }}>*</span>}</span>}
        rules={[{ required: true }]}
        required={false}
        >
          <Input style={formStyles.input} />
        </Form.Item>
        
        <Form.Item 
        name="description" 
        label={<span>Description {<span style={{ color: '#ff4d4f' }}>*</span>}</span>}
        rules={[{ required: true }]}>
          <Input.TextArea style={formStyles.textarea} />
        </Form.Item>
      </div>

      <div style={formStyles.section}>
        <h3 style={formStyles.sectionTitle}>Promotion Period</h3>
        <Form.Item 
          name="start_date" 
          label={<span>Start Date {<span style={{ color: '#ff4d4f' }}>*</span>}</span>} 
          rules={[{ required: true }]}
        >
          <DatePicker 
            value={form.getFieldValue('start_date')}
            onChange={(date) => form.setFieldsValue({ start_date: date })}
            style={formStyles.input}
            position="bottom"
          />
        </Form.Item>

        <Form.Item 
          name="end_date" 
          label={<span>End Date {<span style={{ color: '#ff4d4f' }}>*</span>}</span>} 
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const startDate = getFieldValue('start_date');
                if (!value || !startDate) return Promise.resolve();
                return new Date(value) < new Date(startDate)
                  ? Promise.reject(new Error('End date must be after start date'))
                  : Promise.resolve();
              },
            }),
          ]}
          dependencies={['start_date']}
        >
          <DatePicker 
            value={form.getFieldValue('end_date')}
            onChange={(date) => form.setFieldsValue({ end_date: date })}
            style={formStyles.input}
            position="bottom"
          />
        </Form.Item>
      </div>

      <div style={formStyles.section}>
        <h3 style={formStyles.sectionTitle}>Selected Days (Optional)</h3>
        <Form.Item 
          name="days" 
          label="Days of Week"
        >
          <Checkbox.Group 
            options={daysOfWeek} 
            style={{ display: 'flex', flexDirection: 'column' }}
          />
        </Form.Item>
      </div>

      <div style={formStyles.section}>
      <h3 style={formStyles.sectionTitle}>Promotion Hours (Optional)</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Form.Item 
          name="start_time" 
          label="Start Time"
          style={{ width: '48%' }}
        >
          <CustomTimePicker />
        </Form.Item>

        <Form.Item 
          name="end_time" 
          label="End Time"
          style={{ width: '48%' }}
          dependencies={['start_time']}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                const startTime = getFieldValue('start_time');
                if (!value || !startTime) return Promise.resolve();
                
                // Compare times 
                const [startHour, startMinute] = startTime.split(':').map(Number);
                const [endHour, endMinute] = value.split(':').map(Number);
                
                const startTotalMinutes = startHour * 60 + startMinute;
                const endTotalMinutes = endHour * 60 + endMinute;
                
                return endTotalMinutes > startTotalMinutes
                  ? Promise.resolve()
                  : Promise.reject(new Error('End time must be after start time'));
              },
            }),
          ]}
        >
          <CustomTimePicker />
        </Form.Item>
      </div>
    </div>

      <div style={formStyles.section}>
        <h3 style={formStyles.sectionTitle}>Promotion Image</h3>
        <Form.Item 
          name="image" 
          label="Promo Image" 
          valuePropName="fileList" 
          getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
        >
          <Upload 
            beforeUpload={() => false}
            listType="picture-card"
            maxCount={1}
            style={formStyles.uploadSection}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Promo Image</div>
            </div>
          </Upload>
        </Form.Item>
      </div>
    </div>
  );
};

  const renderForm = () => {
    switch (modalType) {
      case 'category':
        return renderCategoryForm();
      case 'item':
        return renderItemForm();
      case 'promo':
        return renderPromoForm();
      default:
        return null;
    }
  };

  return renderForm();
};

export default MenuManagementForms;