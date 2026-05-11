import { useState } from "react";
import { FormInput, FormSelect, FormDatePicker, FormTimePicker, FormTextarea } from "./index";

/**
 * Example usage of unified form components
 * This demonstrates the standardized form interface across the application
 */
export default function FormComponentsShowcase() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    description: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const categoryOptions = [
    { value: "inventory", label: "Quản lý kho" },
    { value: "purchase", label: "Đơn đặt hàng" },
    { value: "sales", label: "Bán hàng" },
    { value: "report", label: "Báo cáo" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Standardized Form Components
      </h1>

      <form className="space-y-6">
        {/* Basic Text Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            helperText="Họ tên đầy đủ của bạn"
          />

          <FormInput
            label="Email"
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
            helperText="Địa chỉ email hợp lệ"
          />
        </div>

        {/* Phone & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Số điện thoại"
            type="tel"
            placeholder="0123456789"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            helperText="Số điện thoại liên hệ"
          />

          <FormSelect
            label="Danh mục"
            options={categoryOptions}
            value={formData.category}
            onChange={(val) => handleInputChange("category", val)}
            placeholder="Chọn danh mục"
            required
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormDatePicker
            label="Ngày bắt đầu"
            value={formData.startDate}
            onChange={(val) => handleInputChange("startDate", val)}
            placeholder="Chọn ngày bắt đầu"
            required
          />

          <FormDatePicker
            label="Ngày kết thúc"
            value={formData.endDate}
            onChange={(val) => handleInputChange("endDate", val)}
            placeholder="Chọn ngày kết thúc"
          />
        </div>

        {/* Time Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormTimePicker
            label="Giờ bắt đầu"
            value={formData.startTime}
            onChange={(e) => handleInputChange("startTime", e.target.value)}
            placeholder="HH:MM"
          />

          <FormTimePicker
            label="Giờ kết thúc"
            value={formData.endTime}
            onChange={(e) => handleInputChange("endTime", e.target.value)}
            placeholder="HH:MM"
          />
        </div>

        {/* Textarea */}
        <FormTextarea
          label="Mô tả"
          value={formData.description}
          onChange={(val) => handleInputChange("description", val)}
          placeholder="Nhập mô tả chi tiết..."
          rows={5}
          maxLength={500}
          helperText="Mô tả chi tiết về yêu cầu"
        />

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors"
          >
            Gửi biểu mẫu
          </button>
          <button
            type="reset"
            className="px-6 py-2.5 bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Xóa
          </button>
        </div>
      </form>

      {/* Display Form Data */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Form Data Preview
        </h2>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto text-gray-700 dark:text-gray-300">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
