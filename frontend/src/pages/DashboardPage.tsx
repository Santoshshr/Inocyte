import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, MessageSquare, Users, ArrowRight, Inbox } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { companyService } from '../services/company.service';
import { inquiryService } from '../services/inquiry.service';
import { userService } from '../services/user.service';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import type { BadgeTone } from '../components/ui/Badge';

const INQUIRY_STATUS_TONE: Record<string, BadgeTone> = {
  new: 'blue',
  read: 'amber',
  replied: 'green',
  archived: 'gray',
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const totalCompanies = useQuery({
    queryKey: ['stats', 'companies', 'total'],
    queryFn: () => companyService.getCompanies({ page_size: 1 }),
  });
  const activeCompanies = useQuery({
    queryKey: ['stats', 'companies', 'active'],
    queryFn: () => companyService.getCompanies({ page_size: 1, status: 'active' }),
  });
  const newInquiries = useQuery({
    queryKey: ['stats', 'inquiries', 'new'],
    queryFn: () => inquiryService.getInquiries({ page_size: 1, status: 'new' }),
  });
  const totalSubAdmins = useQuery({
    queryKey: ['stats', 'users'],
    queryFn: () => userService.getUsers({ page_size: 1 }),
    enabled: isSuperAdmin,
  });
  const recentInquiries = useQuery({
    queryKey: ['stats', 'inquiries', 'recent'],
    queryFn: () => inquiryService.getInquiries({ page_size: 5 }),
  });

  const stats = [
    { name: 'Total Ventures', value: totalCompanies.data?.count, icon: Building2, isLoading: totalCompanies.isLoading },
    { name: 'Active Ventures', value: activeCompanies.data?.count, icon: CheckCircle2, isLoading: activeCompanies.isLoading },
    { name: 'New Inquiries', value: newInquiries.data?.count, icon: MessageSquare, isLoading: newInquiries.isLoading },
    ...(isSuperAdmin
      ? [{ name: 'Sub-admins', value: totalSubAdmins.data?.count, icon: Users, isLoading: totalSubAdmins.isLoading }]
      : []),
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        Welcome back, {user?.first_name || 'Admin'}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Here's what's happening across INOCYTE today.</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.name} label={item.name} value={item.value ?? 0} icon={item.icon} isLoading={item.isLoading} />
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Inquiries</h2>
          <Link
            to="/admin/inquiries"
            className="flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentInquiries.isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : (recentInquiries.data?.data.length ?? 0) === 0 ? (
          <EmptyState icon={Inbox} title="No inquiries yet" description="Submissions from the contact form will show up here." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentInquiries.data!.data.map((inquiry) => (
              <li key={inquiry.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{inquiry.name}</p>
                  <p className="truncate text-sm text-gray-500">{inquiry.subject || inquiry.email}</p>
                </div>
                <Badge tone={INQUIRY_STATUS_TONE[inquiry.status] || 'gray'}>{inquiry.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
