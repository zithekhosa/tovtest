import React from 'react';
import { useAuth } from "@/hooks/use-auth";
import { TOVLayout } from "@/components/layout/TOVLayout";
import NewLandlordDashboard from '../../components/dashboard/NewLandlordDashboard';

const LandlordDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role !== "landlord") {
    return (
      <TOVLayout
        title="Access Denied"
        subtitle="You don't have permission to view this page"
      >
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-destructive-foreground mb-4">Access denied. This page is for landlords only.</p>
            <button 
              onClick={() => window.location.href = '/'} 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Go Home
            </button>
          </div>
        </div>
      </TOVLayout>
    );
  }

  return (
    <TOVLayout
      title="Dashboard"
      subtitle={`Welcome back, ${user.firstName || user.username}`}
    >
      <NewLandlordDashboard landlordId={user.id} />
    </TOVLayout>
  );
};

export default LandlordDashboard;