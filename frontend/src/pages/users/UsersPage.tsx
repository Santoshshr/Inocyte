import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Users as UsersIcon, Plus } from 'lucide-react';
import { userService } from '../../services/user.service';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types/auth.types';

const PAGE_SIZE = 20;

interface EditModalState {
  user: User;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<EditModalState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', page, search, statusFilter],
    queryFn: () =>
      userService.getUsers({
        page,
        page_size: PAGE_SIZE,
        search: search || undefined,
        is_active: statusFilter || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (newUserData: any) => userService.createUser(newUserData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Sub-admin created successfully');
      setIsCreateModalOpen(false);
      setFormData({ first_name: '', last_name: '', email: '', password: '' });
    },
    onError: (err: any) => {
      const data = err.response?.data;
      const fieldErrors = data?.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const firstKey = Object.keys(fieldErrors)[0];
        toast.error(`${firstKey}: ${fieldErrors[firstKey]}`);
      } else {
        toast.error(data?.message || 'Failed to create sub-admin');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updateData }: { id: string; updateData: any }) => userService.updateUser(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Sub-admin updated successfully');
      setEditModal(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Sub-admin deleted');
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({ id, updateData: { is_active: !currentStatus } });
  };

  const openEditModal = (user: User) => {
    setEditModal({ user, first_name: user.first_name, last_name: user.last_name, is_active: user.is_active });
  };

  const handleEditSave = () => {
    if (!editModal) return;
    updateMutation.mutate({
      id: editModal.user.id,
      updateData: {
        first_name: editModal.first_name,
        last_name: editModal.last_name,
        is_active: editModal.is_active,
      },
    });
  };

  const users = data?.data || [];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage administrator accounts and access."
        action={
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sub-admin
          </Button>
        }
      />

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or email..."
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
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : error ? (
          <EmptyState icon={UsersIcon} title="Failed to load users" description="Please refresh the page." />
        ) : users.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title={search || statusFilter ? 'No users match your filters' : 'No users found'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pl-6">Name</th>
                  <th className="hidden px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:table-cell">Email</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Role</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th className="relative py-3 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap py-3.5 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {user.full_name || `${user.first_name} ${user.last_name}`}
                      {user.id === currentUser?.id && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-3.5 text-sm text-gray-500 md:table-cell">{user.email}</td>
                    <td className="whitespace-nowrap px-3 py-3.5">
                      <Badge tone={user.role === 'SUPERADMIN' ? 'brand' : 'gray'}>
                        {user.role === 'SUPERADMIN' ? 'Super Admin' : 'Sub-admin'}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5">
                      <Badge tone={user.is_active ? 'green' : 'red'}>{user.is_active ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="relative whitespace-nowrap py-3.5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      {user.role !== 'SUPERADMIN' && (
                        <div className="flex justify-end space-x-3">
                          <button onClick={() => openEditModal(user)} className="text-brand-primary hover:text-brand-navy">
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id, user.is_active)}
                            className="text-amber-600 hover:text-amber-800"
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => setDeleteTarget(user)} className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </div>
                      )}
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

      {/* Create Sub-admin Modal */}
      {isCreateModalOpen && (
        <Modal title="Add Sub-admin" onClose={() => setIsCreateModalOpen(false)} maxWidth="max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(formData);
            }}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
                Create Sub-admin
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Sub-admin Modal */}
      {editModal && (
        <Modal title="Edit Sub-admin" subtitle={editModal.user.email} onClose={() => setEditModal(null)} maxWidth="max-w-md">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  value={editModal.first_name}
                  onChange={(e) => setEditModal({ ...editModal, first_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  value={editModal.last_name}
                  onChange={(e) => setEditModal({ ...editModal, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                id="edit-is-active"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                checked={editModal.is_active}
                onChange={(e) => setEditModal({ ...editModal, is_active: e.target.checked })}
              />
              <label htmlFor="edit-is-active" className="text-sm font-medium text-gray-700">
                Account Active
              </label>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setEditModal(null)}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleEditSave} isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete sub-admin?"
          message={`"${deleteTarget.full_name || deleteTarget.email}" will permanently lose access. This cannot be undone.`}
          confirmLabel="Delete"
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
