# Quick Reference - Unified Form Components

## Import

```tsx
import { 
  FormInput, 
  FormSelect, 
  FormDatePicker, 
  FormTimePicker, 
  FormTextarea 
} from "@/components/form";
```

## Quick Examples

### Text Input
```tsx
<FormInput
  label="Name"
  placeholder="Enter name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>
```

### Email Input
```tsx
<FormInput
  type="email"
  label="Email"
  placeholder="user@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  helperText={emailError ? "Invalid email" : ""}
/>
```

### Password Input
```tsx
<FormInput
  type="password"
  label="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
/>
```

### Number Input
```tsx
<FormInput
  type="number"
  label="Quantity"
  min="0"
  step="1"
  value={quantity}
  onChange={(e) => setQuantity(e.target.value)}
/>
```

### Select/Dropdown
```tsx
<FormSelect
  label="Category"
  options={[
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" }
  ]}
  value={category}
  onChange={(val) => setCategory(val)}
  placeholder="Choose option"
/>
```

### Date Picker
```tsx
<FormDatePicker
  label="Start Date"
  value={date}
  onChange={setDate}
  placeholder="Select date"
/>
```

### Time Picker
```tsx
<FormTimePicker
  label="Meeting Time"
  value={time}
  onChange={(e) => setTime(e.target.value)}
/>
```

### Textarea
```tsx
<FormTextarea
  label="Notes"
  value={notes}
  onChange={setNotes}
  rows={4}
  maxLength={500}
  placeholder="Enter notes..."
/>
```

### With Error State
```tsx
<FormInput
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error={hasError}
  helperText={hasError ? "This field is required" : ""}
/>
```

### With Success State
```tsx
<FormInput
  label="Verification Code"
  value={code}
  onChange={(e) => setCode(e.target.value)}
  success={isValid}
  helperText={isValid ? "Code verified!" : ""}
/>
```

### Disabled State
```tsx
<FormInput
  label="Reference ID"
  value={refId}
  disabled
  helperText="Auto-generated"
/>
```

## Layout Example

```tsx
<form className="space-y-6">
  {/* Two column grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <FormInput label="First Name" />
    <FormInput label="Last Name" />
  </div>

  {/* Single column */}
  <FormInput label="Email" type="email" />

  {/* Select */}
  <FormSelect label="Category" options={options} />

  {/* Textarea */}
  <FormTextarea label="Description" rows={4} />

  {/* Buttons */}
  <div className="flex gap-4">
    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
      Submit
    </button>
    <button type="reset" className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg">
      Reset
    </button>
  </div>
</form>
```

## Common Props

| Prop | Default | Type |
|------|---------|------|
| label | - | string |
| placeholder | - | string |
| value | - | string/number |
| disabled | false | boolean |
| error | false | boolean |
| success | false | boolean |
| required | false | boolean |
| helperText | - | string |
| className | "" | string |

## States

- **Default**: Gray border, white background
- **Focus**: Brand colored border with ring
- **Error**: Red border and text
- **Success**: Green border and text
- **Disabled**: Gray background, reduced opacity
- **ReadOnly**: Light gray background (FormInput only)

## Dark Mode
All components automatically support dark mode styling.

## CSS Classes
Components use Tailwind CSS classes for styling. No additional CSS needed.

## File Organization

```
src/components/form/
├── FormInput.tsx           # Text, email, number, etc.
├── FormSelect.tsx          # Dropdown select
├── FormDatePicker.tsx      # Date picker (Flatpickr)
├── FormTimePicker.tsx      # Time picker
├── FormTextarea.tsx        # Multi-line text
├── FormComponentsShowcase.tsx  # Examples
├── Label.tsx               # Reusable label
├── Form.tsx                # Form wrapper
├── index.ts                # Exports
└── input/
    └── InputField.tsx      # Original Input (deprecated)
```
