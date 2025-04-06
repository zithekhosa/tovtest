import { SettingsPage } from "@/components/settings/SettingsPage";
import { DashLayout } from "@/layout/dash-layout";

export default function TenantSettings() {
  return (
    <DashLayout>
      <SettingsPage role="tenant" />
    </DashLayout>
  );
}