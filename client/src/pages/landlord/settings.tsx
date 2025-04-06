import { SettingsPage } from "@/components/settings/SettingsPage";
import { StandardLayout } from "@/components/layout/StandardLayout";

export default function LandlordSettings() {
  return (
    <StandardLayout title="Settings">
      <SettingsPage role="landlord" />
    </StandardLayout>
  );
}