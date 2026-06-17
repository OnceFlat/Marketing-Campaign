import { ResetPasswordForm } from "../reset-password-form";

type Params = Promise<{
  reset?: string[];
}>;

export default async function ResetPasswordPathPage({
  params,
}: {
  params: Params;
}) {
  const { reset = [] } = await params;

  return (
    <ResetPasswordForm
      initialToken={decodePathValue(reset[0] ?? "")}
      initialEmail={decodePathValue(reset[1] ?? "")}
    />
  );
}

function decodePathValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
