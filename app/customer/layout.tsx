import { CustomerPortalShell } from "./CustomerPortalShell";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerPortalShell>{children}</CustomerPortalShell>;
}
