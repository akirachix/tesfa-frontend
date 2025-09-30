import Layout from '../sharedComponents/Layout';
import KanbanBoard from './components/Board';
import { Suspense } from 'react';

export default function KanbanPage() {
  return (
      <Layout>
        <Suspense fallback={<div>Loading...</div>}>
          <KanbanBoard />
        </Suspense>
      </Layout>
  );
}