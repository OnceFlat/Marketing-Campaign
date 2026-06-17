import { ResetPasswordForm } from "./reset-password-form";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = searchParams ? await searchParams : {};

  return (
    <ResetPasswordForm
      initialToken={firstParam(params.token)}
      initialEmail={firstParam(params.email ?? params["amp;email"])}
    />
  );
}

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";

  return value ?? "";
}
