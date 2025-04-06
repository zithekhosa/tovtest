import { SettingsPage } from "@/components/settings/SettingsPage";
import { DashLayout } from "@/layout/dash-layout";

export default function MaintenanceSettings() {
  return (
    <DashLayout>
      <SettingsPage role="maintenance" />
    </DashLayout>
  );
}