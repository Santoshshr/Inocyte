import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Mail, Archive, Inbox } from 'lucide-react';
import { inquiryService } from '../../services/inquiry.service';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import type { BadgeTone } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { ContactInquiry } from '../../types/inquiry.types';

const PAGE_SIZE = 20;

const STATUS_TONE: Record<ContactInquiry['status'], BadgeTone> = {
  new: 'blue',
  read: 'amber',
  replied: 'green',
  archived: 'gray',
};

const STATUS_OPTIONS: ContactInquiry['status'][] = ['new', 'read', 'replied', 'archived'];

export const InquiriesPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<ContactInquiry | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['inquiries', page, search, statusFilter],
    queryFn: () =>
      inquiryService.getInquiries({
        page,
        page_size: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['inquiry', selectedId],
    queryFn: () => inquiryService.getInquiry(selectedId!),
    enabled: !!selectedId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => inquiryService.updateInquiry(id, { status: status as ContactInquiry['status'] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['inquiry', selectedId] });
      toast.success('Status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => inquiryService.deleteInquiry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      toast.success('Inquiry archived');
      setArchiveTarget(null);
      setSelectedId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to archive inquiry');
    },
  });

  const inquiries = data?.data || [];

  return (
    <div>
      <PageHeader title="Inquiries" description="Contact form submissions from the public website." />

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : error ? (
          <EmptyState icon={Mail} title="Failed to load inquiries" description="Please refresh the page." />
        ) : inquiries.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No inquiries found"
            description={search || statusFilter ? 'Try adjusting your search or filter.' : 'Submissions from the contact form will show up here.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pl-6">Name</th>
                  <th className="hidden px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">Email</th>
                  <th className="hidden px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 lg:table-cell">Subject</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="hidden px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {inquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    onClick={() => setSelectedId(inquiry.id)}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3.5 text-sm font-medium text-gray-900 sm:pl-6">{inquiry.name}</td>
                    <td className="hidden whitespace-nowrap px-3 py-3.5 text-sm text-gray-500 md:table-cell">{inquiry.email}</td>
                    <td className="hidden max-w-xs truncate px-3 py-3.5 text-sm text-gray-500 lg:table-cell">{inquiry.subject || '—'}</td>
                    <td className="whitespace-nowrap px-3 py-3.5">
                      <Badge tone={STATUS_TONE[inquiry.status]}>{inquiry.status}</Badge>
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-3.5 text-sm text-gray-500 sm:table-cell">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && data && (
          <Pagination page={page} pageSize={PAGE_SIZE} count={data.count} onPageChange={setPage} />
        )}
      </div>

      {/* Detail Modal */}
      {selectedId && (
        <Modal title="Inquiry" onClose={() => setSelectedId(null)} maxWidth="max-w-lg">
          {detailLoading || !detail ? (
            <div className="space-y-3 py-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
              <div className="h-20 animate-pulse rounded bg-gray-100" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{detail.data.name}</p>
                <a href={`mailto:${detail.data.email}`} className="text-sm text-brand-primary hover:underline">
                  {detail.data.email}
                </a>
              </div>
              {detail.data.subject && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Subject</p>
                  <p className="mt-0.5 text-sm text-gray-800">{detail.data.subject}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Message</p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-800">{detail.data.message}</p>
              </div>
              <p className="text-xs text-gray-400">
                Received {new Date(detail.data.created_at).toLocaleString()}
              </p>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                {isSuperAdmin ? (
                  <select
                    value={detail.data.status}
                    onChange={(e) => updateMutation.mutate({ id: detail.data.id, status: e.target.value })}
                    disabled={updateMutation.isPending}
                    className="rounded-md border border-gray-300 py-1.5 px-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Badge tone={STATUS_TONE[detail.data.status]}>{detail.data.status}</Badge>
                )}

                {isSuperAdmin && detail.data.status !== 'archived' && (
                  <button
                    onClick={() => setArchiveTarget(detail.data)}
                    className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Archive className="h-4 w-4" />
                    Archive
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}

      {archiveTarget && (
        <ConfirmDialog
          title="Archive inquiry?"
          message={`This will hide "${archiveTarget.name}"'s inquiry from active views. This cannot be undone.`}
          confirmLabel="Archive"
          isLoading={archiveMutation.isPending}
          onConfirm={() => archiveMutation.mutate(archiveTarget.id)}
          onCancel={() => setArchiveTarget(null)}
        />
      )}
    </div>
  );
};
