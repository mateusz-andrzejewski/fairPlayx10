import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService, AuthServiceError } from './auth.service';
import {
  createMockSupabaseClient,
  createMockAuthUser,
  createMockSession,
  createMockAuthError,
  asMockSupabaseClient,
  resetSupabaseMocks,
} from '@/test/utils/supabase-mock';
import type { LoginSchemaOutput, RegisterSchemaOutput } from '@/lib/validation/auth';
import type { UserDTO } from '@/types';

describe('AuthService', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>;
  let authService: AuthService;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
    authService = new AuthService(asMockSupabaseClient(mockClient));
    vi.clearAllMocks();
  });

  describe('login()', () => {
    const validCredentials: LoginSchemaOutput = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUserProfile: UserDTO = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'player',
      status: 'approved',
      player_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    describe('successful login', () => {
      it('should return success result with user and session when credentials are valid', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser({ email: validCredentials.email });
        const mockSession = createMockSession();

        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser, session: mockSession },
          error: null,
        });

        const mockQuery = mockClient.from('users');
        mockQuery.maybeSingle.mockResolvedValue({
          data: mockUserProfile,
          error: null,
        });

        // Act
        const result = await authService.login(validCredentials);

        // Assert
        expect(result.success).toBe(true);
        expect(result.message).toBe('Logowanie zakończone sukcesem');
        expect(result.user).toEqual(mockUserProfile);
        expect(result.session).toMatchObject({
          access_token: mockSession.access_token,
          refresh_token: mockSession.refresh_token,
          expires_in: mockSession.expires_in,
          token_type: mockSession.token_type,
        });

        // Verify Supabase calls
        expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
          email: validCredentials.email,
          password: validCredentials.password,
        });
        expect(mockClient.from).toHaveBeenCalledWith('users');
        expect(mockQuery.select).toHaveBeenCalled();
        expect(mockQuery.eq).toHaveBeenCalledWith('email', validCredentials.email);
      });

      it('should normalize email to lowercase in profile lookup', async () => {
        // Arrange
        const uppercaseEmail = 'TEST@EXAMPLE.COM';
        const credentials: LoginSchemaOutput = {
          email: uppercaseEmail,
          password: 'password123',
        };

        const mockAuthUser = createMockAuthUser({ email: uppercaseEmail });
        const mockSession = createMockSession();

        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser, session: mockSession },
          error: null,
        });

        const mockQuery = mockClient.from('users');
        mockQuery.maybeSingle.mockResolvedValue({
          data: { ...mockUserProfile, email: uppercaseEmail.toLowerCase() },
          error: null,
        });

        // Act
        await authService.login(credentials);

        // Assert
        expect(mockQuery.eq).toHaveBeenCalledWith('email', uppercaseEmail.toLowerCase());
      });
    });

    describe('authentication errors', () => {
      it('should throw INVALID_CREDENTIALS error when Supabase auth fails', async () => {
        // Arrange
        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: null, session: null },
          error: createMockAuthError('Invalid login credentials', 400),
        });

        // Act & Assert
        await expect(authService.login(validCredentials)).rejects.toThrow(AuthServiceError);
        await expect(authService.login(validCredentials)).rejects.toMatchObject({
          code: 'INVALID_CREDENTIALS',
          status: 401,
          message: 'Nieprawidłowy email lub hasło',
        });
      });

      it('should throw INTERNAL_ERROR when session is missing', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser();
        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser, session: null },
          error: null,
        });

        // Act & Assert
        await expect(authService.login(validCredentials)).rejects.toThrow(AuthServiceError);
        await expect(authService.login(validCredentials)).rejects.toMatchObject({
          code: 'INTERNAL_ERROR',
          status: 500,
          message: 'Wystąpił błąd podczas logowania',
        });
      });

      it('should throw INTERNAL_ERROR when user is missing', async () => {
        // Arrange
        const mockSession = createMockSession();
        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: null, session: mockSession },
          error: null,
        });

        // Act & Assert
        await expect(authService.login(validCredentials)).rejects.toThrow(AuthServiceError);
        await expect(authService.login(validCredentials)).rejects.toMatchObject({
          code: 'INTERNAL_ERROR',
          status: 500,
        });
      });
    });

    describe('user profile validation', () => {
      it('should throw PENDING_APPROVAL error when user status is pending', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser();
        const mockSession = createMockSession();

        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser, session: mockSession },
          error: null,
        });

        const mockQuery = mockClient.from('users');
        mockQuery.maybeSingle.mockResolvedValue({
          data: { ...mockUserProfile, status: 'pending' },
          error: null,
        });

        // Act & Assert
        await expect(authService.login(validCredentials)).rejects.toThrow(AuthServiceError);
        await expect(authService.login(validCredentials)).rejects.toMatchObject({
          code: 'PENDING_APPROVAL',
          status: 403,
          message: 'Twoje konto oczekuje na zatwierdzenie przez administratora',
        });
      });

      it('should throw ACCOUNT_DISABLED error when user is soft-deleted', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser();
        const mockSession = createMockSession();

        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser, session: mockSession },
          error: null,
        });

        const mockQuery = mockClient.from('users');
        mockQuery.maybeSingle.mockResolvedValue({
          data: { ...mockUserProfile, deleted_at: new Date().toISOString() },
          error: null,
        });

        // Act & Assert
        await expect(authService.login(validCredentials)).rejects.toThrow(AuthServiceError);
        await expect(authService.login(validCredentials)).rejects.toMatchObject({
          code: 'ACCOUNT_DISABLED',
          status: 403,
          message: 'Konto zostało dezaktywowane. Skontaktuj się z administratorem.',
        });
      });

      it('should throw INTERNAL_ERROR when profile fetch fails', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser();
        const mockSession = createMockSession();

        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser, session: mockSession },
          error: null,
        });

        const mockQuery = mockClient.from('users');
        mockQuery.maybeSingle.mockResolvedValue({
          data: null,
          error: { message: 'Database error', code: 'DB_ERROR' } as any,
        });

        // Act & Assert
        await expect(authService.login(validCredentials)).rejects.toThrow(AuthServiceError);
        await expect(authService.login(validCredentials)).rejects.toMatchObject({
          code: 'INTERNAL_ERROR',
          status: 500,
          message: 'Nie udało się pobrać profilu użytkownika',
        });
      });
    });

    describe('profile creation for OAuth users', () => {
      it('should create profile when user authenticates via OAuth without existing profile but throw PENDING_APPROVAL', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser({
          email: 'oauth@example.com',
          user_metadata: {
            first_name: 'OAuth',
            last_name: 'User',
          },
        });
        const mockSession = createMockSession();

        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser, session: mockSession },
          error: null,
        });

        const mockSelectQuery = mockClient.from('users');
        mockSelectQuery.maybeSingle.mockResolvedValue({
          data: null,
          error: null,
        });

        const newProfile: UserDTO = {
          id: 2,
          email: 'oauth@example.com',
          first_name: 'OAuth',
          last_name: 'User',
          role: 'player',
          status: 'pending', // New users start as pending
          player_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        };

        const mockInsertQuery = mockClient.from('users');
        mockInsertQuery.single.mockResolvedValue({
          data: newProfile,
          error: null,
        });

        // Act & Assert
        // New OAuth users are created with pending status, so login throws PENDING_APPROVAL
        await expect(authService.login({ email: 'oauth@example.com', password: 'dummy' })).rejects.toThrow(
          AuthServiceError
        );
        await expect(authService.login({ email: 'oauth@example.com', password: 'dummy' })).rejects.toMatchObject({
          code: 'PENDING_APPROVAL',
          status: 403,
        });

        // Verify profile was created
        expect(mockSelectQuery.select).toHaveBeenCalled();
        expect(mockInsertQuery.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'oauth@example.com',
            first_name: 'OAuth',
            last_name: 'User',
            role: 'player',
            status: 'pending',
            player_id: null,
          })
        );
      });

      it('should extract names from full_name metadata field and create pending profile', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser({
          email: 'oauth@example.com',
          user_metadata: {
            full_name: 'John Michael Doe',
          },
        });
        const mockSession = createMockSession();

        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser, session: mockSession },
          error: null,
        });

        const mockSelectQuery = mockClient.from('users');
        mockSelectQuery.maybeSingle.mockResolvedValue({
          data: null,
          error: null,
        });

        const mockInsertQuery = mockClient.from('users');
        mockInsertQuery.single.mockResolvedValue({
          data: {
            id: 3,
            email: 'oauth@example.com',
            first_name: 'John',
            last_name: 'Michael Doe',
            role: 'player',
            status: 'pending',
            player_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          },
          error: null,
        });

        // Act & Assert - throws PENDING_APPROVAL since new user
        await expect(authService.login({ email: 'oauth@example.com', password: 'dummy' })).rejects.toMatchObject({
          code: 'PENDING_APPROVAL',
        });

        // Verify names were correctly extracted
        expect(mockInsertQuery.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            first_name: 'John',
            last_name: 'Michael Doe',
          })
        );
      });

      it('should fallback to email local part when no metadata available', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser({
          email: 'john.doe@example.com',
          user_metadata: {},
        });
        const mockSession = createMockSession();

        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser, session: mockSession },
          error: null,
        });

        const mockSelectQuery = mockClient.from('users');
        mockSelectQuery.maybeSingle.mockResolvedValue({
          data: null,
          error: null,
        });

        const mockInsertQuery = mockClient.from('users');
        mockInsertQuery.single.mockResolvedValue({
          data: {
            id: 4,
            email: 'john.doe@example.com',
            first_name: 'John',
            last_name: 'Doe',
            role: 'player',
            status: 'pending',
            player_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          },
          error: null,
        });

        // Act & Assert - throws PENDING_APPROVAL since new user
        await expect(authService.login({ email: 'john.doe@example.com', password: 'dummy' })).rejects.toMatchObject({
          code: 'PENDING_APPROVAL',
        });

        // Verify names were correctly extracted from email
        expect(mockInsertQuery.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            first_name: 'John',
            last_name: 'Doe',
          })
        );
      });

      it('should throw INTERNAL_ERROR when profile creation fails', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser();
        const mockSession = createMockSession();

        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser, session: mockSession },
          error: null,
        });

        const mockSelectQuery = mockClient.from('users');
        mockSelectQuery.maybeSingle.mockResolvedValue({
          data: null,
          error: null,
        });

        const mockInsertQuery = mockClient.from('users');
        mockInsertQuery.single.mockResolvedValue({
          data: null,
          error: { message: 'Insert failed', code: 'INSERT_ERROR' } as any,
        });

        // Act & Assert
        await expect(authService.login(validCredentials)).rejects.toThrow(AuthServiceError);
        await expect(authService.login(validCredentials)).rejects.toMatchObject({
          code: 'INTERNAL_ERROR',
          status: 500,
          message: 'Nie udało się utworzyć profilu użytkownika',
        });
      });
    });

    describe('edge cases', () => {
      it('should handle email with extra whitespace', async () => {
        // Arrange
        const credentials: LoginSchemaOutput = {
          email: '  test@example.com  ',
          password: 'password123',
        };

        const mockAuthUser = createMockAuthUser();
        const mockSession = createMockSession();

        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser, session: mockSession },
          error: null,
        });

        const mockQuery = mockClient.from('users');
        mockQuery.maybeSingle.mockResolvedValue({
          data: mockUserProfile,
          error: null,
        });

        // Act
        await authService.login(credentials);

        // Assert
        expect(mockQuery.eq).toHaveBeenCalledWith('email', 'test@example.com');
      });

      it('should handle session with missing optional fields', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser();
        const incompleteSession = {
          access_token: 'token',
          refresh_token: 'refresh',
          expires_in: undefined,
          expires_at: undefined,
          token_type: undefined,
          user: mockAuthUser,
        };

        mockClient.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockAuthUser, session: incompleteSession as any },
          error: null,
        });

        const mockQuery = mockClient.from('users');
        mockQuery.maybeSingle.mockResolvedValue({
          data: mockUserProfile,
          error: null,
        });

        // Act
        const result = await authService.login(validCredentials);

        // Assert
        expect(result.session.expires_in).toBe(3600); // Default value
        expect(result.session.expires_at).toBeUndefined();
      });
    });
  });

  describe('register()', () => {
    const validRegistrationData: RegisterSchemaOutput = {
      email: 'newuser@example.com',
      password: 'SecurePass1',
      first_name: 'New',
      last_name: 'User',
      position: 'forward',
      consent: true,
    };

    describe('successful registration', () => {
      it('should create new user and return success response', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser({ email: validRegistrationData.email });

        // Mock: email doesn't exist
        const mockCheckQuery = mockClient.from('users');
        mockCheckQuery.maybeSingle.mockResolvedValue({
          data: null,
          error: null,
        });

        // Mock: auth signup succeeds
        mockClient.auth.signUp.mockResolvedValue({
          data: { user: mockAuthUser, session: null },
          error: null,
        });

        // Mock: profile creation succeeds
        const newProfile = {
          id: 5,
          email: validRegistrationData.email,
          first_name: validRegistrationData.first_name,
          last_name: validRegistrationData.last_name,
          role: 'player',
          status: 'pending',
          player_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
        };

        const mockInsertQuery = mockClient.from('users');
        mockInsertQuery.single.mockResolvedValue({
          data: newProfile,
          error: null,
        });

        // Act
        const result = await authService.register(validRegistrationData);

        // Assert
        expect(result.success).toBe(true);
        expect(result.message).toContain('Rejestracja zakończona sukcesem');
        expect(result.user).toMatchObject({
          id: newProfile.id,
          email: validRegistrationData.email,
          status: 'pending',
        });

        // Verify calls
        expect(mockClient.auth.signUp).toHaveBeenCalledWith({
          email: validRegistrationData.email,
          password: validRegistrationData.password,
          options: {
            data: {
              first_name: validRegistrationData.first_name,
              last_name: validRegistrationData.last_name,
              position: validRegistrationData.position,
            },
            emailRedirectTo: expect.any(String),
          },
        });

        expect(mockInsertQuery.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            email: validRegistrationData.email,
            first_name: validRegistrationData.first_name,
            last_name: validRegistrationData.last_name,
            role: 'player',
            status: 'pending',
            player_id: null,
          })
        );
      });

      it('should include position in auth user metadata', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser();

        const mockCheckQuery = mockClient.from('users');
        mockCheckQuery.maybeSingle.mockResolvedValue({ data: null, error: null });

        mockClient.auth.signUp.mockResolvedValue({
          data: { user: mockAuthUser, session: null },
          error: null,
        });

        const mockInsertQuery = mockClient.from('users');
        mockInsertQuery.single.mockResolvedValue({
          data: {
            id: 6,
            email: validRegistrationData.email,
            first_name: validRegistrationData.first_name,
            last_name: validRegistrationData.last_name,
            role: 'player',
            status: 'pending',
            player_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          },
          error: null,
        });

        // Act
        await authService.register(validRegistrationData);

        // Assert
        expect(mockClient.auth.signUp).toHaveBeenCalledWith(
          expect.objectContaining({
            options: expect.objectContaining({
              data: expect.objectContaining({
                position: 'forward',
              }),
            }),
          })
        );
      });
    });

    describe('validation errors', () => {
      it('should throw EMAIL_TAKEN error when email already exists in database', async () => {
        // Arrange
        const existingUser = {
          id: 7,
          email: validRegistrationData.email,
        };

        const mockCheckQuery = mockClient.from('users');
        mockCheckQuery.maybeSingle.mockResolvedValue({
          data: existingUser,
          error: null,
        });

        // Act & Assert
        await expect(authService.register(validRegistrationData)).rejects.toThrow(AuthServiceError);
        await expect(authService.register(validRegistrationData)).rejects.toMatchObject({
          code: 'EMAIL_TAKEN',
          status: 400,
          message: 'Adres email jest już zajęty',
        });

        // Auth signup should not be called
        expect(mockClient.auth.signUp).not.toHaveBeenCalled();
      });

      it('should throw EMAIL_TAKEN error when Supabase auth reports duplicate email', async () => {
        // Arrange
        const mockCheckQuery = mockClient.from('users');
        mockCheckQuery.maybeSingle.mockResolvedValue({ data: null, error: null });

        mockClient.auth.signUp.mockResolvedValue({
          data: { user: null, session: null },
          error: createMockAuthError('User already registered', 400),
        });

        // Act & Assert
        await expect(authService.register(validRegistrationData)).rejects.toThrow(AuthServiceError);
        await expect(authService.register(validRegistrationData)).rejects.toMatchObject({
          code: 'EMAIL_TAKEN',
          status: 400,
          message: 'Adres email jest już zajęty',
        });
      });

      it('should throw INTERNAL_ERROR when email check fails', async () => {
        // Arrange
        const mockCheckQuery = mockClient.from('users');
        mockCheckQuery.maybeSingle.mockResolvedValue({
          data: null,
          error: { message: 'Database error', code: 'DB_ERROR' } as any,
        });

        // Act & Assert
        await expect(authService.register(validRegistrationData)).rejects.toThrow(AuthServiceError);
        await expect(authService.register(validRegistrationData)).rejects.toMatchObject({
          code: 'INTERNAL_ERROR',
          status: 500,
          message: 'Nie udało się sprawdzić dostępności adresu email',
        });
      });

      it('should throw INTERNAL_ERROR when Supabase auth signup fails', async () => {
        // Arrange
        const mockCheckQuery = mockClient.from('users');
        mockCheckQuery.maybeSingle.mockResolvedValue({ data: null, error: null });

        mockClient.auth.signUp.mockResolvedValue({
          data: { user: null, session: null },
          error: createMockAuthError('Authentication service unavailable', 500),
        });

        // Act & Assert
        await expect(authService.register(validRegistrationData)).rejects.toThrow(AuthServiceError);
        await expect(authService.register(validRegistrationData)).rejects.toMatchObject({
          code: 'INTERNAL_ERROR',
          status: 500,
          message: 'Nie udało się utworzyć konta',
        });
      });

      it('should throw INTERNAL_ERROR when no auth user is returned', async () => {
        // Arrange
        const mockCheckQuery = mockClient.from('users');
        mockCheckQuery.maybeSingle.mockResolvedValue({ data: null, error: null });

        mockClient.auth.signUp.mockResolvedValue({
          data: { user: null, session: null },
          error: null,
        });

        // Act & Assert
        await expect(authService.register(validRegistrationData)).rejects.toThrow(AuthServiceError);
        await expect(authService.register(validRegistrationData)).rejects.toMatchObject({
          code: 'INTERNAL_ERROR',
          status: 500,
          message: 'Nie udało się utworzyć konta',
        });
      });

      it('should throw INTERNAL_ERROR when profile creation fails', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser();

        const mockCheckQuery = mockClient.from('users');
        mockCheckQuery.maybeSingle.mockResolvedValue({ data: null, error: null });

        mockClient.auth.signUp.mockResolvedValue({
          data: { user: mockAuthUser, session: null },
          error: null,
        });

        const mockInsertQuery = mockClient.from('users');
        mockInsertQuery.single.mockResolvedValue({
          data: null,
          error: { message: 'Constraint violation', code: 'CONSTRAINT' } as any,
        });

        // Act & Assert
        await expect(authService.register(validRegistrationData)).rejects.toThrow(AuthServiceError);
        await expect(authService.register(validRegistrationData)).rejects.toMatchObject({
          code: 'INTERNAL_ERROR',
          status: 500,
          message: 'Nie udało się utworzyć profilu użytkownika',
        });
      });
    });

    describe('edge cases', () => {
      it('should handle different player positions', async () => {
        // Arrange
        const positions: Array<'forward' | 'midfielder' | 'defender' | 'goalkeeper'> = [
          'forward',
          'midfielder',
          'defender',
          'goalkeeper',
        ];

        for (const position of positions) {
          vi.clearAllMocks();

          const mockAuthUser = createMockAuthUser();
          const mockCheckQuery = mockClient.from('users');
          mockCheckQuery.maybeSingle.mockResolvedValue({ data: null, error: null });

          mockClient.auth.signUp.mockResolvedValue({
            data: { user: mockAuthUser, session: null },
            error: null,
          });

          const mockInsertQuery = mockClient.from('users');
          mockInsertQuery.single.mockResolvedValue({
            data: {
              id: 8,
              email: `${position}@example.com`,
              first_name: 'Test',
              last_name: 'Player',
              role: 'player',
              status: 'pending',
              player_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
            },
            error: null,
          });

          // Act
          await authService.register({
            ...validRegistrationData,
            email: `${position}@example.com`,
            position,
          });

          // Assert
          expect(mockClient.auth.signUp).toHaveBeenCalledWith(
            expect.objectContaining({
              options: expect.objectContaining({
                data: expect.objectContaining({ position }),
              }),
            })
          );
        }
      });

      it('should set consent metadata correctly', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser();

        const mockCheckQuery = mockClient.from('users');
        mockCheckQuery.maybeSingle.mockResolvedValue({ data: null, error: null });

        mockClient.auth.signUp.mockResolvedValue({
          data: { user: mockAuthUser, session: null },
          error: null,
        });

        const mockInsertQuery = mockClient.from('users');
        mockInsertQuery.single.mockResolvedValue({
          data: {
            id: 9,
            email: validRegistrationData.email,
            first_name: validRegistrationData.first_name,
            last_name: validRegistrationData.last_name,
            role: 'player',
            status: 'pending',
            player_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          },
          error: null,
        });

        // Act
        await authService.register(validRegistrationData);

        // Assert
        expect(mockInsertQuery.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            consent_date: expect.any(String),
            consent_version: '1.0',
          })
        );
      });

      it('should use placeholder password hash for auth-managed passwords', async () => {
        // Arrange
        const mockAuthUser = createMockAuthUser();

        const mockCheckQuery = mockClient.from('users');
        mockCheckQuery.maybeSingle.mockResolvedValue({ data: null, error: null });

        mockClient.auth.signUp.mockResolvedValue({
          data: { user: mockAuthUser, session: null },
          error: null,
        });

        const mockInsertQuery = mockClient.from('users');
        mockInsertQuery.single.mockResolvedValue({
          data: {
            id: 10,
            email: validRegistrationData.email,
            first_name: validRegistrationData.first_name,
            last_name: validRegistrationData.last_name,
            role: 'player',
            status: 'pending',
            player_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          },
          error: null,
        });

        // Act
        await authService.register(validRegistrationData);

        // Assert
        expect(mockInsertQuery.insert).toHaveBeenCalledWith(
          expect.objectContaining({
            password_hash: 'supabase-auth-managed',
          })
        );
      });
    });
  });
});

