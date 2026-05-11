import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Đăng nhập | Warehouse Management"
        description="Đăng nhập để truy cập hệ thống quản lý kho"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
