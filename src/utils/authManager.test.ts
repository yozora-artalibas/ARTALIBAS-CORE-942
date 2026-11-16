import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeAndDeduplicateUsers,
  deleteUserAccount,
  deleteOwnUserAccount,
  updateAdmin2Credentials,
  getRoleDisplayName,
  DEFAULT_USERS,
} from './authManager';
import { AppUser } from '../types/auth';

test('getRoleDisplayName returns exact Indonesian Hak Akses titles', () => {
  const zulfiUser: AppUser = {
    id: 'user_admin_01',
    username: 'zulfi',
    password: 'artalibas942',
    namaLengkap: 'Zulfi Nur F',
    pangkat: 'Komandan KIMA',
    role: 'admin',
    isPrimaryAdmin: true,
    status: 'active',
    createdAt: 'Senin, 02 November 2026',
  };

  const baminUser: AppUser = {
    id: 'user_admin_02',
    username: 'bamin',
    password: 'bamin942',
    namaLengkap: 'Bamin Kompi Markas',
    pangkat: 'Serka',
    role: 'admin',
    isPrimaryAdmin: false,
    status: 'active',
    createdAt: 'Senin, 02 November 2026',
  };

  const regularUser: AppUser = {
    id: 'user_operator_02',
    username: 'user',
    password: 'user942',
    namaLengkap: 'Operator KIMA',
    role: 'user',
    isPrimaryAdmin: false,
    status: 'active',
    createdAt: 'Senin, 02 November 2026',
  };

  assert.equal(getRoleDisplayName(zulfiUser), 'Administrator Utama');
  assert.equal(getRoleDisplayName(baminUser), 'Admin');
  assert.equal(getRoleDisplayName(regularUser), 'User');
});

test('DEFAULT_USERS has correct credentials and roles', () => {
  const zulfi = DEFAULT_USERS.find((u) => u.username === 'zulfi');
  assert.ok(zulfi);
  assert.equal(zulfi.password, 'artalibas942');
  assert.equal(zulfi.role, 'admin');
  assert.equal(zulfi.isPrimaryAdmin, true);
  assert.equal(getRoleDisplayName(zulfi), 'Administrator Utama');

  const bamin = DEFAULT_USERS.find((u) => u.username === 'bamin');
  assert.ok(bamin);
  assert.equal(bamin.password, 'bamin942');
  assert.equal(bamin.role, 'admin');
  assert.equal(bamin.isPrimaryAdmin, false);
  assert.equal(getRoleDisplayName(bamin), 'Admin');

  const user = DEFAULT_USERS.find((u) => u.username === 'user');
  assert.ok(user);
  assert.equal(user.password, 'user942');
  assert.equal(user.role, 'user');
  assert.equal(getRoleDisplayName(user), 'User');
});

test('sanitizeAndDeduplicateUsers enforces max 2 admins (Zulfi & Bamin)', () => {
  const usersWithTooManyAdmins: AppUser[] = [
    {
      id: 'user_admin_01',
      username: 'zulfi',
      password: 'artalibas942',
      namaLengkap: 'Zulfi Nur F',
      pangkat: 'Komandan KIMA',
      role: 'admin',
      isPrimaryAdmin: true,
      status: 'active',
      createdAt: 'Senin, 02 November 2026',
    },
    {
      id: 'user_admin_02',
      username: 'bamin',
      password: 'bamin942',
      namaLengkap: 'Bamin Kompi Markas',
      pangkat: 'Serka',
      role: 'admin',
      isPrimaryAdmin: false,
      status: 'active',
      createdAt: 'Senin, 02 November 2026',
    },
    {
      id: 'user_admin_03',
      username: 'third_admin',
      password: 'pwd',
      namaLengkap: 'Third Imposter Admin',
      pangkat: 'Serda',
      role: 'admin',
      isPrimaryAdmin: false,
      status: 'active',
      createdAt: 'Senin, 02 November 2026',
    },
  ];

  const result = sanitizeAndDeduplicateUsers(usersWithTooManyAdmins);
  const admins = result.filter((u) => u.role === 'admin');
  assert.equal(admins.length, 2, 'Total admins must strictly not exceed 2');
  assert.equal(admins[0].username, 'zulfi');
  assert.equal(admins[1].username, 'bamin');
  assert.equal(result.find((u) => u.username === 'third_admin')?.role, 'user', 'Third admin downgraded to user');
});

test('deleteUserAccount allows Administrator Utama to delete Admin (Bamin) or any other user, but not self', () => {
  // Administrator Utama tries to delete Bamin -> allowed
  const resDelBamin = deleteUserAccount('user_admin_01', 'user_admin_02');
  assert.equal(resDelBamin.success, true);
  assert.ok(resDelBamin.message.includes('berhasil dihapus'));

  // Administrator Utama tries to delete self -> blocked
  const resDelSelf = deleteUserAccount('user_admin_01', 'user_admin_01');
  assert.equal(resDelSelf.success, false);

  // Bamin tries to delete Administrator Utama -> blocked
  const resBaminDelUtama = deleteUserAccount('user_admin_02', 'user_admin_01');
  assert.equal(resBaminDelUtama.success, false);
  assert.ok(resBaminDelUtama.message.includes('Administrator Utama'));
});

test('deleteOwnUserAccount prevents Administrator Utama from deleting self, but allows Admin 2 Bamin and regular user', () => {
  const resAdminUtama = deleteOwnUserAccount('user_admin_01');
  assert.equal(resAdminUtama.success, false);
  assert.ok(resAdminUtama.message.includes('Administrator Utama'));

  const resBamin = deleteOwnUserAccount('user_admin_02');
  assert.equal(resBamin.success, true);

  const resUser = deleteOwnUserAccount('user_operator_02');
  assert.equal(resUser.success, true);
});

