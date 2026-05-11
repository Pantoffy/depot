# Hướng dẫn di chuyển sang Form Components Chuẩn hóa

## Tổng quan
Ứng dụng đã được cập nhật với các form component chuẩn hóa, đảm bảo giao diện nhất quán trên toàn bộ ứng dụng.

## Components Mới

### 1. **FormInput** - Thay thế cho Input component cũ
Được sử dụng cho: text, email, password, number, tel, url, search

**Trước:**
```tsx
import Input from "@/components/form/input/InputField";

<div>
  <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
  <Input 
    type="email" 
    placeholder="Enter email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>
```

**Sau:**
```tsx
import { FormInput } from "@/components/form";

<FormInput
  label="Email"
  type="email"
  placeholder="Enter email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  helperText="Nhập email của bạn"
/>
```

### 2. **FormSelect** - Thay thế cho Select component cũ
Được sử dụng cho: dropdown select

**Trước:**
```tsx
import Select from "@/components/form/Select";

<div>
  <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
  <Select
    options={options}
    placeholder="Select an option"
    onChange={handleChange}
  />
</div>
```

**Sau:**
```tsx
import { FormSelect } from "@/components/form";

<FormSelect
  label="Category"
  options={options}
  placeholder="Select an option"
  value={selected}
  onChange={handleChange}
  required
/>
```

### 3. **FormDatePicker** - Thay thế cho Flatpickr cũ
Được sử dụng cho: date selection

**Trước:**
```tsx
import Flatpickr from "react-flatpickr";

<div className="relative flatpickr-wrapper">
  <Flatpickr
    value={date}
    onChange={(dates) => setDate(dates[0].toISOString().split("T")[0])}
    options={{ dateFormat: "Y-m-d", altFormat: "d/m/Y" }}
    className="h-11 w-full rounded-lg border..."
  />
  <CalenderIcon className="absolute right-3 top-1/2..." />
</div>
```

**Sau:**
```tsx
import { FormDatePicker } from "@/components/form";

<FormDatePicker
  label="Delivery Date"
  value={date}
  onChange={setDate}
  placeholder="Select date"
  required
/>
```

### 4. **FormTimePicker** - Cho time input
Được sử dụng cho: time selection

```tsx
import { FormTimePicker } from "@/components/form";

<FormTimePicker
  label="Start Time"
  value={time}
  onChange={(e) => setTime(e.target.value)}
/>
```

### 5. **FormTextarea** - Thay thế cho TextArea cũ
Được sử dụng cho: multi-line text

**Trước:**
```tsx
import TextArea from "@/components/form/input/TextArea";

<div>
  <label className="mb-1.5 block text-sm font-medium">Notes</label>
  <TextArea
    value={notes}
    onChange={(val) => setNotes(val)}
    rows={4}
  />
</div>
```

**Sau:**
```tsx
import { FormTextarea } from "@/components/form";

<FormTextarea
  label="Notes"
  value={notes}
  onChange={setNotes}
  rows={4}
  maxLength={500}
  required
/>
```

## Chuyển đổi Forms Hiện tại

### Ví dụ: PurchaseOrder Page

**Trước:**
```tsx
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Flatpickr from "react-flatpickr";

function Input({ label, value, onChange, type = "text" }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium...">{label}</label>
      <input type={type} value={value} onChange={onChange} className="..." />
    </div>
  );
}

// Usage
<Input
  label="Mã đơn"
  value={formData.code}
  onChange={(v) => setFormData({ ...formData, code: v })}
/>
```

**Sau:**
```tsx
import { FormInput, FormSelect, FormDatePicker, FormTextarea } from "@/components/form";

// Usage
<FormInput
  label="Mã đơn"
  value={formData.code}
  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
  required
/>
```

## Props Chung

Tất cả form components chia sẻ các props:

| Prop | Type | Mô tả |
|------|------|-------|
| `label` | string | Label hiển thị trên input |
| `value` | string/number | Giá trị hiện tại |
| `onChange` | function | Hàm xử lý khi thay đổi |
| `onBlur` | function | Hàm xử lý khi mất focus |
| `onFocus` | function | Hàm xử lý khi focus |
| `disabled` | boolean | Tắt input |
| `error` | boolean | Trạng thái lỗi (viền đỏ) |
| `success` | boolean | Trạng thái thành công (viền xanh) |
| `hint` / `helperText` | string | Văn bản hỗ trợ dưới input |
| `required` | boolean | Hiển thị dấu * |
| `className` | string | CSS class bổ sung |

## Styling Nhất quán

Tất cả components có:
- ✅ Chiều cao: `h-11` (44px)
- ✅ Padding: `px-4 py-2.5`
- ✅ Border radius: `rounded-lg`
- ✅ Focus ring: `ring-2`
- ✅ Dark mode support
- ✅ States: default, error, success, disabled

## Lợi ích

1. **Nhất quán**: Tất cả form elements cùng look & feel
2. **Dễ bảo trì**: Cập nhật styling ở một nơi
3. **Accessibility**: Proper labels, helper text, error states
4. **Developer friendly**: Cấu hình đơn giản, props rõ ràng
5. **Dark mode**: Full support out of the box

## Danh sách Files cần cập nhật

Các file sau nên được cập nhật để sử dụng components mới:
- `src/pages/Forms/PurchaseOrder.tsx`
- `src/pages/Forms/Material.tsx`
- `src/pages/Forms/Supplier.tsx`
- `src/pages/Forms/Stock.tsx`
- `src/pages/Inventory/**`
- Bất kỳ file nào sử dụng form inputs

## Tham khảo thêm

Xem file `FormComponentsShowcase.tsx` để xem ví dụ đầy đủ sử dụng tất cả components.
