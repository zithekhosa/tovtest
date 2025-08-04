import { SettingsPage } from "@/components/settings/SettingsPage";
import DashLayout from "@/components/layout/DashLayout";

export default function AgencySettings() {
  return (
    <DashLayout>
      <SettingsPage role="agency" />
    </DashLayout>
  );
}