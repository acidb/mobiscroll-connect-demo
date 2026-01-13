'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/common/Layout/Layout';
import JsonViewer from '@/components/common/JsonViewer/JsonViewer';

interface Calendar {
  id: string;
  title: string;
  provider: 'google' | 'microsoft' | 'apple';
  timeZone?: string;
  color?: string;
  accessRole?: string;
}

export default function CalendarsPage() {
  const [calendars, setCalendars] = useState<Calendar[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiInfo, setApiInfo] = useState({ method: '', url: '', params: '' });

  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = async () => {
    setLoading(true);
    setError(null);
    setCalendars(null);

    const apiUrl = '/api/calendars';
    const apiMethod = 'GET';
    const apiParams = 'None';

    try {
      const response = await fetch(apiUrl);

      if (response.status === 401) {
        globalThis.location.href = '/api/logout';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setApiInfo({ method: apiMethod, url: apiUrl, params: apiParams });
      setCalendars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendars');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Calendar List</h1>
      <button className="refresh mb-4" onClick={loadCalendars}>
        Refresh
      </button>

      {apiInfo.url && (
        <div className="api-info-compact mb-6">
          <span className="api-badge api-method">{apiInfo.method}</span>
          <span className="api-url font-mono text-sm">{apiInfo.url}</span>
          <span className="api-params text-gray-600 dark:text-gray-400 ml-2">{apiInfo.params}</span>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div className="error bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {calendars && <JsonViewer src={calendars} collapsed={2} />}
    </Layout>
  );
}
