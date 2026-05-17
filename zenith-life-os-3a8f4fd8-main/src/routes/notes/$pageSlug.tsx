/**
 * Wave 06 — Editor Page Route
 * src/routes/notes/$pageSlug.tsx
 *
 * يعرض BlockEditor لصفحة notes محددة
 */
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { fetchPageBlocks } from '../../lib/block-engine/block-repo';

const BlockEditor = lazy(() =>
  import('../../components/editor/BlockEditor').then((m) => ({ default: m.BlockEditor }))
);

export const Route = createFileRoute('/notes/$pageSlug')({
  component: EditorPage,
});

function EditorPage() {
  const { pageSlug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['blocks', pageSlug],
    queryFn: () => fetchPageBlocks(pageSlug),
    enabled: !!user?.id && !!pageSlug,
    staleTime: 30_000,
  });

  if (!user) {
    void navigate({ to: '/auth/login' as never });
    return null;
  }

  const workspaceId = user.user_metadata?.workspace_id ?? '';

  return (
    <main style={{ minHeight: '100vh', background: 'hsl(220, 20%, 7%)' }}>
      {/* Breadcrumb placeholder */}
      <div style={{
        padding: '0.75rem 2rem',
        borderBottom: '1px solid hsl(220,15%,14%)',
        fontSize: '0.8rem',
        color: 'hsl(210,10%,55%)',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
      }}>
        <span>الملاحظات</span>
        <span>/</span>
        <span style={{ color: 'hsl(210,15%,85%)' }}>{pageSlug}</span>
      </div>

      {isLoading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'hsl(210,10%,50%)' }}>
          جارٍ تحميل الصفحة...
        </div>
      ) : (
        <Suspense fallback={
          <div style={{ padding: '4rem', textAlign: 'center', color: 'hsl(210,10%,50%)' }}>
            جارٍ تهيئة المحرر...
          </div>
        }>
          <BlockEditor
            pageId={pageSlug}
            workspaceId={workspaceId}
            initialBlocks={blocks}
          />
        </Suspense>
      )}
    </main>
  );
}
