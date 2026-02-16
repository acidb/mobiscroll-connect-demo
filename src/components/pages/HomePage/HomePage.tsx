'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/common/Layout/Layout';
import { defaultConfig } from '@/lib/default';

export default function HomePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configVisible, setConfigVisible] = useState(true);
  const [configSaved, setConfigSaved] = useState(false);
  const [config, setConfig] = useState({
    userId: 'user-id',
    providers: ['google', 'apple', 'microsoft', 'caldav'],
  });
  const searchParams = useSearchParams();

  useEffect(() => {
    checkAuthStatus();
    loadConfig();

    if (searchParams.get('error') === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const loadConfig = () => {
    const providersString = localStorage.getItem('providers') || 'google,apple,microsoft,caldav';
    const providers = providersString
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    setConfig({
      userId: localStorage.getItem('user_id') || 'user-id',
      providers,
    });
  };

  const saveConfig = () => {
    localStorage.setItem('user_id', config.userId);
    localStorage.setItem('providers', config.providers.join(','));
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      setAuthenticated(data.authenticated);
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectCalendars = () => {
    const params = new URLSearchParams({
      user_id: config.userId,
      providers: config.providers.join(','),
    });

    globalThis.location.href = `/api/auth?${params.toString()}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Demo App</h1>
      <p className="mb-6">This app serves as an end-user&apos;s application to test the Mobiscroll Connect functionalities</p>
      <hr className="my-6 border-gray-300 dark:border-zinc-700" />

      <button className="toggle-config-btn mb-4" onClick={() => setConfigVisible(!configVisible)}>
        Configuration
      </button>

      {configVisible && (
        <div className="config-section bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Configuration</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            These settings control how the Demo App identifies a user&apos;s account and which calendar providers appear on the
            authorization screen.
          </p>

          <div className="form-group mb-4">
            <label className="block font-medium mb-2">User ID</label>
            <input
              type="text"
              value={config.userId}
              onChange={(e) => setConfig({ ...config, userId: e.target.value })}
              placeholder="user-id"
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800"
            />
            <small className="text-gray-600 dark:text-gray-400 text-sm">
              This is the unique identifier your app passes to Mobiscroll Connect so calendar data is linked to the correct end user.
            </small>
          </div>

          <div className="form-group mb-4 w-1/2">
            <label className="block font-medium mb-2">Providers</label>

            <table className="checkbox-group w-1/3 mb-1">
              <tbody>
                {['google', 'apple', 'microsoft', 'caldav'].map((provider) => (
                  <tr key={provider} className="align-middle">
                    <td className="align-middle py-1">
                      <label className="capitalize" htmlFor={`provider-${provider}`}>
                        {provider === 'caldav' ? 'CalDAV' : provider}
                      </label>
                    </td>
                    <td className="align-middle py-1">
                      <input
                        id={`provider-${provider}`}
                        type="checkbox"
                        checked={config.providers.includes(provider)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig({ ...config, providers: [...config.providers, provider] });
                          } else {
                            setConfig({ ...config, providers: config.providers.filter((p) => p !== provider) });
                          }
                        }}
                        className="w-4 h-4 align-middle"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <small className="text-gray-600 dark:text-gray-400 text-sm">
              Select which providers to show on the authorization screen. Only checked providers will be available for connection. If none
              is selected, it defaults to all providers being shown.
            </small>
          </div>

          <button className="bg-blue-600" onClick={saveConfig}>
            Save Configuration
          </button>
          {configSaved && <span className="ml-3 text-green-600 font-semibold">✓ Saved</span>}
        </div>
      )}

      {error && (
        <div className="error bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {!authenticated ? (
        <div className="status-section my-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2.5">
            <span className="status-indicator status-disconnected"></span>
            Not Connected
          </h2>
          <p className="mb-4">Connect your calendar accounts to get started</p>
          <button onClick={connectCalendars}>Connect Calendars</button>
        </div>
      ) : (
        <div className="status-section my-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2.5">
            <span className="status-indicator status-connected"></span> Connected to Mobiscroll Connect
          </h2>
          <div className="button-group flex gap-2 flex-wrap">
            <button className="logout" onClick={() => (globalThis.location.href = '/api/logout')}>
              Log Out
            </button>
            <button onClick={connectCalendars}>Connect More Calendars</button>
          </div>
        </div>
      )}
    </Layout>
  );
}
