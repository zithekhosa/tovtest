import { SettingsPage } from "@/components/settings/SettingsPage";
import { TOVLayout } from "@/components/layout/TOVLayout";

export default function TenantSettings() {
  return (
    <TOVLayout title="Settings" subtitle="Manage your account preferences">
      <SettingsPage role="tenant" />
    </TOVLayout>
  );
}