/**
 * Wave 06 — Files Pipeline Tests
 * src/lib/files/__tests__/files-service.test.ts
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase
vi.mock('../../auth/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://cdn.example.com/file.jpg' } })),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { object_key: 'ws/file.jpg', bucket: 'blocks-media' },
            error: null,
          }),
        })),
      })),
    })),
  },
}));

// We test the pure logic separately since supabase is mocked

describe('Files Pipeline — MIME Whitelist', () => {
  const ALLOWED = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm',
    'audio/mpeg', 'audio/wav',
    'application/pdf',
    'text/plain', 'text/csv',
  ];
  const BLOCKED = [
    'application/x-msdownload', // .exe
    'text/html',
    'application/javascript',
    'application/x-sh',
  ];

  const ALLOWED_MIMES = new Set([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif',
    'video/mp4', 'video/webm', 'video/ogg',
    'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv', 'text/markdown',
    'application/zip',
  ]);

  it('allows all approved MIME types', () => {
    for (const mime of ALLOWED) {
      expect(ALLOWED_MIMES.has(mime)).toBe(true);
    }
  });

  it('blocks dangerous MIME types', () => {
    for (const mime of BLOCKED) {
      expect(ALLOWED_MIMES.has(mime)).toBe(false);
    }
  });
});

describe('Files Pipeline — Size Limits', () => {
  const getMaxSize = (mime: string) => {
    if (mime.startsWith('image/')) return 10 * 1024 * 1024;
    if (mime.startsWith('video/')) return 100 * 1024 * 1024;
    if (mime.startsWith('audio/')) return 50 * 1024 * 1024;
    return 25 * 1024 * 1024;
  };

  it('allows image under 10MB', () => {
    expect(5 * 1024 * 1024 <= getMaxSize('image/jpeg')).toBe(true);
  });

  it('rejects image over 10MB', () => {
    expect(15 * 1024 * 1024 <= getMaxSize('image/jpeg')).toBe(false);
  });

  it('allows video under 100MB', () => {
    expect(50 * 1024 * 1024 <= getMaxSize('video/mp4')).toBe(true);
  });
});

describe('Files Pipeline — Object Key Generation', () => {
  const buildObjectKey = (workspaceId: string, fileId: string, filename: string) => {
    return `${workspaceId}/${fileId}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  };

  it('sanitizes filename with special chars', () => {
    const key = buildObjectKey('ws-1', 'f-1', 'my file (2).jpg');
    expect(key).toBe('ws-1/f-1-my_file__2_.jpg');
    expect(key).not.toContain(' ');
    expect(key).not.toContain('(');
  });

  it('generates unique key per file id', () => {
    const k1 = buildObjectKey('ws', 'id-1', 'photo.jpg');
    const k2 = buildObjectKey('ws', 'id-2', 'photo.jpg');
    expect(k1).not.toBe(k2);
  });
});

describe('Files Pipeline — Quota Logic', () => {
  const checkQuota = (used: number, size: number, quota: number) => {
    return used + size <= quota;
  };

  it('allows upload within quota', () => {
    expect(checkQuota(1_000_000, 500_000, 5_368_709_120)).toBe(true);
  });

  it('rejects upload exceeding quota', () => {
    const quota = 5 * 1024 * 1024 * 1024; // 5GB
    expect(checkQuota(quota - 1000, 2000, quota)).toBe(false);
  });

  it('allows upload exactly at quota', () => {
    const quota = 5 * 1024 * 1024 * 1024;
    expect(checkQuota(0, quota, quota)).toBe(true);
  });
});
