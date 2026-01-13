import { Suspense } from 'react';
import HomePage from '@/components/pages/HomePage';
import Layout from '@/components/common/Layout/Layout';

export default function Home() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </Layout>
      }
    >
      <HomePage />
    </Suspense>
  );
}
