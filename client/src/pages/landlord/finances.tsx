// Redirect finances to analytics (unified system)
import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function LandlordFinances() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to analytics with financials tab active
    setLocation('/landlord/analytics?tab=financials');
  }, [setLocation]);
  
  return null;
}