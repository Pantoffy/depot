import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      {/* Back */}
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Quay lại trang chủ
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* Title */}
          <div className="mb-6">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng ký
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nhập thông tin để tạo tài khoản mới
            </p>
          </div>

          {/* Divider (giữ border) */}
          <div className="py-3">
            <div className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>

          {/* Form */}
          <form>
            <div className="space-y-5">
              {/* Họ & Tên */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>
                    Họ <span className="text-error-500">*</span>
                  </Label>
                  <Input placeholder="Nhập họ" />
                </div>

                <div>
                  <Label>
                    Tên <span className="text-error-500">*</span>
                  </Label>
                  <Input placeholder="Nhập tên" />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input type="email" placeholder="example@gmail.com" />
              </div>

              {/* Password */}
              <div>
                <Label>
                  Mật khẩu <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>

              {/* Điều khoản */}
              <div className="flex items-start gap-3">
                <Checkbox
                  className="w-5 h-5 mt-1"
                  checked={isChecked}
                  onChange={setIsChecked}
                />
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Bằng việc tạo tài khoản, bạn đồng ý với{" "}
                  <span className="text-gray-800 dark:text-white/90">
                    Điều khoản sử dụng
                  </span>{" "}
                  và{" "}
                  <span className="text-gray-800 dark:text-white/90">
                    Chính sách bảo mật
                  </span>
                  .
                </p>
              </div>

              {/* Submit */}
              <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                Đăng ký
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Đã có tài khoản?{" "}
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
