import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Upload, X, ExternalLink, Trash2, Pencil, Plus, Building2, Search } from 'lucide-react';
import { companyService } from '../../services/company.service';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../../hooks/useAuth';
import { getMediaUrl } from '../../utils/media';
import type { Company, Industry } from '../../types/company.types';
import type { BadgeTone } from '../../components/ui/Badge';

const PAGE_SIZE = 20;

interface CompanyFormState {
  name: string;
  tagline: string;
  description: string;
  status: 'active' | 'upcoming' | 'archived';
  industry: string;
  website_url: string;
  display_order: number;
  is_featured: boolean;
  logo: File | null;
  existingLogo: string | null;
}

const defaultForm: CompanyFormState = {
  name: '',
  tagline: '',
  description: '',
  status: 'upcoming',
  industry: '',
  website_url: '',
  display_order: 0,
  is_featured: false,
  logo: null,
  existingLogo: null,
};

const STATUS_TONE: Record<Company['status'], BadgeTone> = {
  active: 'green',
  upcoming: 'amber',
  archived: 'gray',
};

function buildFormData(form: CompanyFormState): FormData {
  const fd = new FormData();
  fd.append('name', form.name);
  fd.append('tagline', form.tagline);
  fd.append('description', form.description);
  fd.append('status', form.status);
  fd.append('website_url', form.website_url);
  fd.append('display_order', String(form.display_order));
  fd.append('is_featured', String(form.is_featured));
  if (form.industry) fd.append('industry', form.industry);
  if (form.logo) fd.append('logo', form.logo);
  return fd;
}

// ── Logo Upload Field ────────────────────────────────
const LogoUpload: React.FC<{
  logo: File | null;
  existingLogo: string | null;
  onChange: (file: File | null) => void;
}> = ({ logo, existingLogo, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = logo ? URL.createObjectURL(logo) : getMediaUrl(existingLogo);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
      <div
        className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-primary transition-colors bg-gray-50"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <img src={preview} alt="Logo preview" className="max-h-28 max-w-full object-contain rounded" />
            <button
              type="button"
              className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-gray-500 hover:text-red-500"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-1" />
            <p className="text-sm text-gray-500">Click to upload logo</p>
            <p className="text-xs text-gray-400">PNG, JPG, SVG (max 2MB)</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </div>
    </div>
  );
};

// ── Company Form Modal ──────────────────────────────
const CompanyModal: React.FC<{
  title: string;
  form: CompanyFormState;
  industries: Industry[];
  isLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: (updates: Partial<CompanyFormState>) => void;
}> = ({ title, form, industries, isLoading, onClose, onSubmit, onChange }) => (
  <Modal title={title} onClose={onClose}>
    <div className="space-y-5">
      {/* Logo */}
        <LogoUpload
          logo={form.logo}
          existingLogo={form.existingLogo}
          onChange={(file) => onChange({ logo: file })}
        />

        {/* Name + Tagline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venture Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Nirogi Health"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline / Title</label>
            <input
              type="text"
              placeholder="Short catchy description"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              value={form.tagline}
              onChange={(e) => onChange({ tagline: e.target.value })}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={4}
            placeholder="Describe what this venture does..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>

        {/* URL + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input
              type="url"
              placeholder="https://example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              value={form.website_url}
              onChange={(e) => onChange({ website_url: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white"
              value={form.status}
              onChange={(e) => onChange({ status: e.target.value as any })}
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Industry + Display Order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white"
              value={form.industry}
              onChange={(e) => onChange({ industry: e.target.value })}
            >
              <option value="">— None —</option>
              {industries.map((ind) => (
                <option key={ind.id} value={ind.id}>{ind.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              value={form.display_order}
              onChange={(e) => onChange({ display_order: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Featured toggle */}
        <div className="flex items-center space-x-3">
          <input
            id="is_featured"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
            checked={form.is_featured}
            onChange={(e) => onChange({ is_featured: e.target.checked })}
          />
          <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
            Mark as Featured
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3 border-t border-gray-100 pt-4">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={onSubmit} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Venture'}
        </Button>
      </div>
  </Modal>
);


// ── Main Page ────────────────────────────────────────
export const CompaniesPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [form, setForm] = useState<CompanyFormState>(defaultForm);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['companies', page, search, statusFilter],
    queryFn: () =>
      companyService.getCompanies({
        page,
        page_size: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
  });

  const { data: industriesData } = useQuery({
    queryKey: ['industries'],
    queryFn: () => companyService.getIndustries(),
  });

  const industries = industriesData?.data || [];

  const createMutation = useMutation({
    mutationFn: () => companyService.createCompany(buildFormData(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Venture created successfully');
      setCreateOpen(false);
      setForm(defaultForm);
    },
    onError: (err: any) => {
      const data = err.response?.data;
      const fieldErrors = data?.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const firstKey = Object.keys(fieldErrors)[0];
        toast.error(`${firstKey}: ${fieldErrors[firstKey]}`);
      } else {
        toast.error(data?.message || 'Failed to create venture');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => companyService.updateCompany(editTarget!.id, buildFormData(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Venture updated successfully');
      setEditTarget(null);
      setForm(defaultForm);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update venture');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => companyService.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Venture archived');
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to archive venture');
    },
  });

  const openEdit = (company: Company) => {
    setEditTarget(company);
    setForm({
      name: company.name,
      tagline: company.tagline || '',
      description: company.description || '',
      status: company.status,
      industry: company.industry || '',
      website_url: company.website_url || '',
      display_order: company.display_order,
      is_featured: company.is_featured,
      logo: null,
      existingLogo: company.logo || null,
    });
  };

  const openCreate = () => {
    setForm(defaultForm);
    setCreateOpen(true);
  };

  const handleDelete = (company: Company) => setDeleteTarget(company);

  const companies = data?.data || [];

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Manage INOCYTE portfolio ventures — logo, title, description, and URL."
        action={
          isSuperAdmin && (
            <Button variant="primary" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          )
        }
      />

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search ventures..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 py-2 px-3 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={Building2} title="Failed to load ventures" description="Please refresh the page." />
      ) : companies.length === 0 ? (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white">
          <EmptyState
            icon={Building2}
            title={search || statusFilter ? 'No ventures match your filters' : 'No ventures yet'}
            description={
              !search && !statusFilter && isSuperAdmin ? 'Click "Add Company" to create your first venture.' : undefined
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              {/* Logo */}
              <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b border-gray-100">
                {company.logo ? (
                  <img
                    src={getMediaUrl(company.logo)!}
                    alt={`${company.name} logo`}
                    className="max-h-28 max-w-[80%] object-contain"
                  />
                ) : (
                  <Building2 className="h-14 w-14 text-gray-300" />
                )}
              </div>

              <div className="flex flex-col flex-1 p-5">
                {/* Name + Status */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-gray-900 leading-tight">
                    {company.name}
                  </h3>
                  <Badge tone={STATUS_TONE[company.status]}>{company.status}</Badge>
                </div>

                {/* Tagline */}
                {company.tagline && (
                  <p className="mt-1 text-sm text-brand-primary font-medium leading-snug">
                    {company.tagline}
                  </p>
                )}

                {/* Description */}
                {company.description && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-3 leading-relaxed">
                    {company.description}
                  </p>
                )}

                {/* Industry */}
                {company.industry_name && (
                  <span className="mt-3 inline-flex self-start rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {company.industry_name}
                  </span>
                )}

                {/* URL */}
                {company.website_url && (
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center space-x-1 text-xs text-brand-primary hover:underline truncate"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="truncate">{company.website_url}</span>
                  </a>
                )}

                {/* Actions */}
                {isSuperAdmin && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => openEdit(company)}
                      className="flex items-center space-x-1 rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(company)}
                      className="flex items-center space-x-1 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Archive</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !error && data && data.count > PAGE_SIZE && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white">
          <Pagination page={page} pageSize={PAGE_SIZE} count={data.count} onPageChange={setPage} />
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <CompanyModal
          title="Add New Venture"
          form={form}
          industries={industries}
          isLoading={createMutation.isPending}
          onClose={() => { setCreateOpen(false); setForm(defaultForm); }}
          onSubmit={() => createMutation.mutate()}
          onChange={(updates) => setForm((prev) => ({ ...prev, ...updates }))}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <CompanyModal
          title={`Edit — ${editTarget.name}`}
          form={form}
          industries={industries}
          isLoading={updateMutation.isPending}
          onClose={() => { setEditTarget(null); setForm(defaultForm); }}
          onSubmit={() => updateMutation.mutate()}
          onChange={(updates) => setForm((prev) => ({ ...prev, ...updates }))}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Archive venture?"
          message={`"${deleteTarget.name}" will be hidden from the public site. This cannot be undone.`}
          confirmLabel="Archive"
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
