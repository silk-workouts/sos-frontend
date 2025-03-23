// app/(dashboard)/dashboard/profile/reset-password/page.tsx
import ResetPasswordForm from "../../../../components/ResetPasswordForm/ResetPasswordForm";

type Props = {
  searchParams: Promise<{ token?: string; id?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token, id } = await searchParams;

  if (!token || !id) {
    return <p>Invalid or missing reset link.</p>;
  }

  return <ResetPasswordForm token={token} userId={id} />;
}
