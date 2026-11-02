# Security Specification: TeiscoGames Firestore ABAC & RBAC

## 1. Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only have `uid == userId == request.auth.uid`. A regular user cannot self-assign `role: "admin"` unless they are the bootstrapped admin `teisco181@gmail.com`.
2. **Role Immutability for Non-Admins**: A non-admin user cannot modify their own `role` or another user's `role`.
3. **Games Admin Gate**: Only verified administrators (`isAdmin()`) can create, update, or delete games in `/games/{gameId}`.
4. **Announcements Admin Gate**: Only verified administrators (`isAdmin()`) can create, update, or delete announcements in `/announcements/{announcementId}`.
5. **Read Privacy**:
   - `users`: Individual user document can be read by the owner (`request.auth.uid == userId`) or by an admin.
   - `games`: Readable by any authenticated user.
   - `announcements`: Readable by any authenticated user.
6. **Temporal Integrity**: `createdAt` must match `request.time` on creation. `createdAt` and `createdBy` must be immutable on update.
7. **Volumetric Boundaries**: Strict string length limits on all text fields to avoid Denial-of-Wallet attacks.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1: Privilege Escalation via User Registration**
   - Attempt by random user (`attacker@evil.com`) to register with `role: "admin"`.
   - Result: REJECTED (Non-whitelisted email cannot set role='admin').

2. **Payload 2: Role Tampering via Profile Update**
   - Existing regular user (`role: "user"`) sends update `{ "role": "admin" }`.
   - Result: REJECTED (Non-admin cannot modify `role` field).

3. **Payload 3: Identity Spoofing in User Creation**
   - User authenticated as `uid_123` attempts to write to `/users/uid_456` or sets `uid: "uid_456"`.
   - Result: REJECTED (`userId != request.auth.uid` or `incoming().uid != request.auth.uid`).

4. **Payload 4: Unauthorized Game Publishing by Regular User**
   - Non-admin user attempts `create` on `/games/flappy-bird` with their own UID.
   - Result: REJECTED (`isAdmin()` check fails).

5. **Payload 5: Game Author Impersonation by Admin or Malicious Client**
   - User creates game with `createdBy: "different_uid"`.
   - Result: REJECTED (`incoming().createdBy != request.auth.uid`).

6. **Payload 6: Unauthorized Game Deletion**
   - Non-admin user sends `delete` request to `/games/super-mario`.
   - Result: REJECTED (`isAdmin()` required for delete).

7. **Payload 7: Unauthorized Announcement Creation**
   - Normal user posts announcement to `/announcements/fake-news`.
   - Result: REJECTED (`isAdmin()` check fails).

8. **Payload 8: Game Field Oversizing (Denial-of-Wallet)**
   - Admin or attacker sends game title with 50,000 characters.
   - Result: REJECTED (`incoming().title.size() <= 100` constraint violation).

9. **Payload 9: Announcement Ghost Field Injection (Shadow Update)**
   - User updates announcement injecting unknown field `{ "hiddenMalwareUrl": "http://..." }`.
   - Result: REJECTED (`affectedKeys().hasOnly(...)` gate).

10. **Payload 10: Timestamp Spoofing (Temporal Violation)**
    - Client attempts to set `createdAt: timestamp("2020-01-01T00:00:00Z")`.
    - Result: REJECTED (`incoming().createdAt == request.time`).

11. **Payload 11: Document ID Poisoning**
    - Client writes to document path with 2KB invalid characters: `/games/$$$___junk_path_overflow`.
    - Result: REJECTED (`isValidId(gameId)` regex validation).

12. **Payload 12: Unauthenticated Reading of Private User Profiles**
    - Unauthenticated user or unauthorized user queries another user's private email/profile.
    - Result: REJECTED (`isOwner(userId) || isAdmin()` required).
