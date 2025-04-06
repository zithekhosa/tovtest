import { SettingsPage } from "@/components/settings/SettingsPage";
import { DashLayout } from "@/layout/dash-layout";

export default function LandlordSettings() {
  return (
    <DashLayout>
      <SettingsPage role="landlord" />
    </DashLayout>
  );
}