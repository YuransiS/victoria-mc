import { cookies } from 'next/headers';
import { verifyToken } from '@/actions/auth';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import { redirect } from 'next/navigation';

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  
  if (!token) {
    redirect('/login');
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    redirect('/login');
  }

  // Double guard check: SALES cannot view analytics page
  if (decoded.role === 'SALES') {
    redirect('/admin/leads');
  }

  return (
    <AdminDashboardClient 
      role={decoded.role} 
      username={decoded.username} 
      onlyView="analytics" 
    />
  );
}
