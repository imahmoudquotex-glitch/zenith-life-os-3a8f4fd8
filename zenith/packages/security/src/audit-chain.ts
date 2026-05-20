import { createHash } from 'node:crypto';

export type AuditEvent = {
  id: string;
  prevHash: string;
  rowHash: string;
  workspaceId: string;
  createdAt: string;
};

function hashNodes(left: Buffer, right: Buffer): Buffer {
  return createHash('sha256')
    .update(Buffer.concat([left, right]))
    .digest();
}

function hashEvent(event: AuditEvent): Buffer {
  return createHash('sha256')
    .update(JSON.stringify(event))
    .digest();
}

export async function computeMerkleRoot(events: AuditEvent[]): Promise<Buffer> {
  if (events.length === 0) {
    return Buffer.alloc(32, 0);
  }

  let nodes = events.map(hashEvent);

  while (nodes.length > 1) {
    const nextLevel: Buffer[] = [];
    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i]!;
      const right = i + 1 < nodes.length ? nodes[i + 1]! : left;
      nextLevel.push(hashNodes(left, right));
    }
    nodes = nextLevel;
  }

  return nodes[0]!;
}

export function merkleRootToHex(root: Buffer): string {
  return root.toString('hex');
}

export function hexToMerkleRoot(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}
