import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { settingsService } from '../../services/settings.service';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { SiteSetting } from '../../types/settings.types';

function formatLabel(key: string): string {
  return key
    .replace(/^(site|contact|social)_/, '')
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

function fieldType(key: string): 'email' | 'url' | 'textarea' | 'text' {
  if (key.endsWith('_email')) return 'email';
  if (key.startsWith('social_') || key.endsWith('_url')) return 'url';
  if (key.endsWith('_description') || key.endsWith('_address')) return 'textarea';
  return 'text';
}

function validateField(key: string, value: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined; // blank is always allowed
  if (fieldType(key) === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? undefined : 'Enter a valid email address.';
  }
  if (fieldType(key) === 'url') {
    try {
      new URL(v);
      return undefined;
    } catch {
      return 'Enter a valid URL, including https://';
    }
  }
  return undefined;
}

const GROUPS: { key: SiteSetting['group']; title: string }[] = [
  { key: 'general', title: 'General Settings' },
  { key: 'contact', title: 'Contact Settings' },
  { key: 'social', title: 'Social Links' },
];

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'SUPERADMIN';
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  });

  const settings = useMemo(() => data?.data || [], [data]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const initialized = useRef(false);

  useEffect(() => {
    if (settings.length && !initialized.current) {
      const map: Record<string, string> = {};
      settings.forEach((s) => {
        map[s.key] = s.value;
      });
      setValues(map);
      setOriginal(map);
      initialized.current = true;
    }
  }, [settings]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    Object.entries(values).forEach(([key, value]) => {
      const msg = validateField(key, value);
      if (msg) e[key] = msg;
    });
    return e;
  }, [values]);

  const dirtyKeys = useMemo(
    () => Object.keys(values).filter((k) => values[k] !== original[k]),
    [values, original]
  );
  const isDirty = dirtyKeys.length > 0;
  const hasErrors = Object.keys(errors).length > 0;

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const saveMutation = useMutation({
    mutationFn: () =>
      settingsService.bulkUpdateSettings(dirtyKeys.map((key) => ({ key, value: values[key] }))),
    onSuccess: (res) => {
      setOriginal((prev) => {
        const next = { ...prev };
        (res.data || []).forEach((s) => {
          next[s.key] = s.value;
        });
        return next;
      });
      toast.success('Settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err: any) => {
      const data = err.response?.data;
      const fieldErrors = data?.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        const firstKey = Object.keys(fieldErrors)[0];
        toast.error(`${firstKey}: ${fieldErrors[firstKey]}`);
      } else {
        toast.error(data?.message || 'Failed to save settings');
      }
    },
  });

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleDiscard = () => setValues(original);

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Loading settings...</div>;
  if (error) return <div className="p-6 text-sm text-red-500">Failed to load settings.</div>;

  const renderField = (setting: SiteSetting) => {
    const type = fieldType(setting.key);
    const value = values[setting.key] ?? '';
    const label = formatLabel(setting.key);

    if (type === 'textarea') {
      return (
        <div className="sm:col-span-6" key={setting.key}>
          <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
          <textarea
            rows={3}
            className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
            value={value}
            disabled={!canEdit}
            onChange={(e) => handleChange(setting.key, e.target.value)}
          />
          {errors[setting.key] && <p className="mt-1 text-sm text-red-500">{errors[setting.key]}</p>}
        </div>
      );
    }

    return (
      <div className="sm:col-span-3" key={setting.key}>
        <Input
          label={label}
          type={type === 'url' ? 'text' : type}
          placeholder={type === 'url' ? 'https://...' : undefined}
          value={value}
          disabled={!canEdit}
          error={errors[setting.key]}
          onChange={(e) => handleChange(setting.key, e.target.value)}
        />
      </div>
    );
  };

  const renderSettingGroup = (groupKey: string, title: string, groupSettings: SiteSetting[]) => (
    <div className="mt-8 border-t border-gray-200 pt-8 first:mt-0 first:border-t-0 first:pt-0" key={groupKey}>
      <div>
        <h2 className="text-lg font-medium leading-6 text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage {title.toLowerCase()} for the INOCYTE parent website.
        </p>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        {groupSettings.map(renderField)}
        {groupSettings.length === 0 && (
          <div className="sm:col-span-6 text-sm text-gray-500">No settings in this group.</div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Site Settings</h1>
          {isDirty && <p className="mt-1 text-sm text-amber-600">You have unsaved changes.</p>}
        </div>
        <div className="mt-4 flex gap-3 sm:mt-0">
          {isDirty && (
            <Button variant="secondary" onClick={handleDiscard} disabled={saveMutation.isPending}>
              Discard
            </Button>
          )}
          {canEdit && (
            <Button
              variant="primary"
              onClick={() => saveMutation.mutate()}
              disabled={!isDirty || hasErrors || saveMutation.isPending}
              isLoading={saveMutation.isPending}
            >
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {!canEdit && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have read-only access to site settings. Contact a super admin to make changes.
        </div>
      )}

      <div className="mt-6 space-y-8 divide-y divide-gray-200 bg-white p-6 shadow sm:rounded-lg">
        {GROUPS.map(({ key, title }) =>
          renderSettingGroup(
            key,
            title,
            settings.filter((s) => s.group === key)
          )
        )}
      </div>
    </div>
  );
};
