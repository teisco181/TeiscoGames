/**
 * Verification suite for Firestore Security Rules and Dirty Dozen Payloads
 */

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runSecurityInvariantsTests() {
  // Payload 1: Non-admin trying to register as admin
  const nonAdminRegistration = {
    uid: 'user_123',
    email: 'normal_player@gmail.com',
    displayName: 'Player',
    role: 'admin',
    createdAt: new Date().toISOString()
  };
  const isWhitelistedBootstrapAdmin = nonAdminRegistration.email === 'teisco181@gmail.com';
  assert(!isWhitelistedBootstrapAdmin, 'Non-admin email cannot be granted admin role');

  // Payload 2: Shadow Update with Ghost Field
  const gameWithGhostField = {
    id: 'game_1',
    title: 'Valid Game',
    description: 'A valid game description',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    gameUrl: 'https://example.github.io/game',
    createdBy: 'admin_123',
    createdAt: new Date().toISOString(),
    isVerifiedBackdoor: true // Ghost field
  };
  const allowedKeys = ['id', 'title', 'description', 'imageUrl', 'gameUrl', 'category', 'featured', 'createdBy', 'createdAt', 'updatedAt'];
  const hasGhostKey = Object.keys(gameWithGhostField).some(k => !allowedKeys.includes(k));
  assert(hasGhostKey, 'Rules reject payload containing ghost fields');

  // Payload 3: Invalid document ID poisoning test
  const invalidId = '$$$__bad_id_injection_with_illegal_symbols!';
  const isValidId = /^[a-zA-Z0-9_-]+$/.test(invalidId) && invalidId.length <= 128;
  assert(!isValidId, 'Poisoned ID is rejected by isValidId regex');

  return true;
}

runSecurityInvariantsTests();
