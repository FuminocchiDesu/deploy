import React, {useState} from 'react';
import { Form, Input, Select, Upload, Button, Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
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
  form 
  
}) => {
  const renderItemForm = () => (
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
      <Form.Item 
      name="image" 
      label="Primary Image" 
      valuePropName="fileList" 
      getValueFromEvent={(e) => {
        if (Array.isArray(e)) {
          return e;
        }
        return e?.fileList;
      }}
    >
      <Upload 
        beforeUpload={() => false}
        listType="picture-card"
        maxCount={1}
        accept="image/*"
      >
        {form.getFieldValue('image')?.length < 1 && (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Primary Image</div>
          </div>
        )}
      </Upload>
    </Form.Item>

    <Form.Item 
      name="additional_images" 
      label="Additional Images"
      valuePropName="fileList"
      getValueFromEvent={(e) => {
        if (Array.isArray(e)) {
          return e;
        }
        return e?.fileList;
      }}
    >
      <Upload
        beforeUpload={() => false}
        listType="picture-card"
        multiple={true}
        accept="image/*"
        onPreview={async (file) => {
          if (!file.url && !file.preview) {
            file.preview = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.readAsDataURL(file.originFileObj);
              reader.onload = () => resolve(reader.result);
            });
          }
          // Open image in new window for preview
          window.open(file.url || file.preview, '_blank');
        }}
      >
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Additional Images</div>
        </div>
      </Upload>
    </Form.Item>
      <Form.Item name="useMainPrice" valuePropName="checked">
        <Checkbox onChange={(e) => setUseMainPrice(e.target.checked)}>
          Use main price (no sizes)
        </Checkbox>
      </Form.Item>
      
      {useMainPrice ? (
        <Form.Item name="price" label="Price" rules={[{ required: true }]}>
          <Input type="number" step="0.01" />
        </Form.Item>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700">Sizes and Prices</label>
          {sizes.map((size, index) => (
            <div key={index} className="flex items-center space-x-2 mt-2">
              <Input
                value={size.size}
                onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                placeholder="Size"
                className="w-1/3"
              />
              <Input
                type="number"
                value={size.price}
                onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                placeholder="Price"
                step="0.01"
                className="w-1/3"
              />
              <Button onClick={() => removeSize(index)} icon={<DeleteOutlined />} />
            </div>
          ))}
          <Button type="dashed" onClick={addSize} className="mt-2">
            + Add Size
          </Button>
        </div>
      )}
    </>
  );

  const renderCategoryForm = () => (
    <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
  );

  const renderPromoForm = () => (
    <>
      <Form.Item name="name" label="Promo Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description" rules={[{ required: true }]}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item 
        name="start_date" 
        label="Start Date" 
        rules={[{ required: true }]}
      >
        <DatePicker 
          value={form.getFieldValue('start_date')}
          onChange={(date) => form.setFieldsValue({ start_date: date })}
        />
      </Form.Item>

      <Form.Item 
        name="end_date" 
        label="End Date" 
        rules={[
          { required: true },
          ({ getFieldValue }) => ({
            validator(_, value) {
              const startDate = getFieldValue('start_date');
              if (!value || !startDate) {
                return Promise.resolve();
              }
              if (new Date(value) < new Date(startDate)) {
                return Promise.reject(new Error('End date must be after start date'));
              }
              return Promise.resolve();
            },
          }),
        ]}
        dependencies={['start_date']}
      >
        <DatePicker 
          value={form.getFieldValue('end_date')}
          onChange={(date) => form.setFieldsValue({ end_date: date })}
        />
      </Form.Item>
      <Form.Item 
        name="image" 
        label="Promo Image" 
        valuePropName="fileList" 
        getValueFromEvent={(e) => {
          if (Array.isArray(e)) {
            return e;
          }
          return e && e.fileList;
        }}
      >
        <Upload 
          beforeUpload={() => false}
          listType="picture-card"
          maxCount={1}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Promo Image</div>
          </div>
        </Upload>
      </Form.Item>
    </>
  );

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