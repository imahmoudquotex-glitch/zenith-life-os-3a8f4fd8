#!/usr/bin/env tsx
/**
 * CI Script: verify-audit-chain
 * Validates that Merkle chain computation is correct.
 * Run: pnpm tsx scripts/verify-audit-chain.ts
 */

import { computeMerkleRoot, merkleRootToHex, hexToMerkleRoot } from '../packages/audit/src/merkle.js'

async function main() {
  let passed = 0
  let failed = 0

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ ${message}`)
      passed++
    } else {
      console.error(`  ❌ ${message}`)
      failed++
    }
  }

  console.log('\n🔍 Verify Audit Merkle Chain\n')

  // Test 1: Empty set → zero root
  console.log('Test 1: Empty event set')
  const emptyRoot = await computeMerkleRoot([])
  const emptyHex = merkleRootToHex(emptyRoot)
  assert(emptyHex === '0'.repeat(64), `Empty root = all zeros: ${emptyHex.slice(0, 16)}...`)

  // Test 2: Single event → deterministic hash
  console.log('\nTest 2: Single event hash')
  const singleEvents = [
    { id: 'aaa001', prevHash: '0'.repeat(64), rowHash: 'rowABC', workspaceId: 'ws1', createdAt: '2026-01-01' },
  ]
  const singleRoot1 = await computeMerkleRoot(singleEvents)
  const singleRoot2 = await computeMerkleRoot(singleEvents)
  assert(merkleRootToHex(singleRoot1) === merkleRootToHex(singleRoot2), 'Same input → same root (deterministic)')
  assert(merkleRootToHex(singleRoot1).length === 64, 'Root is 64 hex chars (32 bytes)')

  // Test 3: Two events → different root from single
  console.log('\nTest 3: Two events')
  const twoEvents = [
    { id: 'aaa001', prevHash: '0'.repeat(64), rowHash: 'rowABC', workspaceId: 'ws1', createdAt: '2026-01-01' },
    { id: 'bbb002', prevHash: 'rowABC', rowHash: 'rowDEF', workspaceId: 'ws1', createdAt: '2026-01-01' },
  ]
  const twoRoot = await computeMerkleRoot(twoEvents)
  assert(merkleRootToHex(twoRoot) !== merkleRootToHex(singleRoot1), 'Two events → different root from single')

  // Test 4: Order matters (tamper detection)
  console.log('\nTest 4: Order matters (tamper detection)')
  const reversedEvents = [...twoEvents].reverse()
  const reversedRoot = await computeMerkleRoot(reversedEvents)
  assert(merkleRootToHex(reversedRoot) !== merkleRootToHex(twoRoot), 'Reversed order → different root')

  // Test 5: Round-trip hex conversion
  console.log('\nTest 5: Hex round-trip')
  const hexStr = merkleRootToHex(twoRoot)
  const restored = hexToMerkleRoot(hexStr)
  const restoredHex = merkleRootToHex(restored)
  assert(hexStr === restoredHex, 'Hex → bytes → hex round-trip is lossless')

  // Test 6: Odd number of events (3 events)
  console.log('\nTest 6: Odd number of events (3)')
  const threeEvents = [
    ...twoEvents,
    { id: 'ccc003', prevHash: 'rowDEF', rowHash: 'rowGHI', workspaceId: 'ws1', createdAt: '2026-01-01' },
  ]
  const threeRoot = await computeMerkleRoot(threeEvents)
  assert(merkleRootToHex(threeRoot).length === 64, 'Odd event count produces valid 64-char root')

  // Summary
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Results: ${passed} passed, ${failed} failed`)

  if (failed > 0) {
    console.error('\n❌ Audit chain verification FAILED')
    process.exit(1)
  } else {
    console.log('\n✅ Audit Merkle chain verification PASSED')
    process.exit(0)
  }
}

main().catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
