import { SettingsPage } from "@/components/settings/SettingsPage";
import { DashLayout } from "@/layout/dash-layout";

export default function AgencySettings() {
  return (
    <DashLayout>
      <SettingsPage role="agency" />
    </DashLayout>
  );
}