import { vi } from 'vitest';
import type { SupabaseClient } from '@/db/supabase.client';
import type { User as SupabaseAuthUser, Session, AuthError } from '@supabase/supabase-js';

/**
 * Utility functions for mocking Supabase Client in unit tests
 * Based on Vitest best practices - uses vi.fn() for function mocks
 */

interface MockQueryBuilder {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  neq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  is: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
}

interface MockAuth {
  signInWithPassword: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  getUser: ReturnType<typeof vi.fn>;
  getSession: ReturnType<typeof vi.fn>;
  onAuthStateChange: ReturnType<typeof vi.fn>;
}

interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>;
  auth: MockAuth;
  rpc: ReturnType<typeof vi.fn>;
  channel: ReturnType<typeof vi.fn>;
}

/**
 * Creates a fully mocked Supabase Client with chainable query builder
 * All methods return `this` by default for fluent chaining
 */
export function createMockSupabaseClient(): MockSupabaseClient {
  const mockQuery: MockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };

  return {
    from: vi.fn(() => mockQuery),
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    rpc: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  };
}

/**
 * Helper to create a mock Supabase Auth User
 */
export function createMockAuthUser(overrides: Partial<SupabaseAuthUser> = {}): SupabaseAuthUser {
  return {
    id: 'mock-auth-user-id',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    email_confirmed_at: new Date().toISOString(),
    phone: null,
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {
      first_name: 'Test',
      last_name: 'User',
    },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false,
    ...overrides,
  };
}

/**
 * Helper to create a mock Supabase Session
 */
export function createMockSession(overrides: Partial<Session> = {}): Session {
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: createMockAuthUser(),
    ...overrides,
  };
}

/**
 * Helper to create a mock AuthError
 */
export function createMockAuthError(message: string, status = 400): AuthError {
  return {
    name: 'AuthError',
    message,
    status,
  } as AuthError;
}

/**
 * Type-safe cast for using mocked Supabase client in tests
 * This preserves TypeScript type checking while using mocks
 */
export function asMockSupabaseClient(client: MockSupabaseClient): SupabaseClient {
  return client as unknown as SupabaseClient;
}

/**
 * Helper to reset all mocks in a Supabase client
 * Useful in beforeEach/afterEach hooks
 */
export function resetSupabaseMocks(client: MockSupabaseClient): void {
  vi.mocked(client.from).mockClear();
  vi.mocked(client.auth.signInWithPassword).mockClear();
  vi.mocked(client.auth.signUp).mockClear();
  vi.mocked(client.auth.signOut).mockClear();
  vi.mocked(client.auth.getUser).mockClear();
  vi.mocked(client.auth.getSession).mockClear();
  vi.mocked(client.rpc).mockClear();
}

