import { SettingsPage } from "@/components/settings/SettingsPage";
import DashLayout from "@/components/layout/DashLayout";

export default function MaintenanceSettings() {
  return (
    <DashLayout>
      <SettingsPage role="maintenance" />
    </DashLayout>
  );
}