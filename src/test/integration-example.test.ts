import { describe, it, expect } from "vitest";
import { getConnectionString } from "./integration-setup";

/**
 * Example integration test using Testcontainers
 *
 * These tests run against a real PostgreSQL database in a Docker container
 * They are slower than unit tests but provide higher confidence
 *
 * To run integration tests separately:
 * vitest run --testNamePattern="Integration"
 */

describe.skip("Integration: Database Operations", () => {
  it("should connect to test database", async () => {
    const connectionString = getConnectionString();
    expect(connectionString).toContain("postgresql://");
    expect(connectionString).toContain("test_db");
  });

  // Add your integration tests here
  // Example:
  // it('should create a user in database', async () => {
  //   const supabase = createClient(connectionString, 'anon-key');
  //   const { data, error } = await supabase
  //     .from('users')
  //     .insert({ email: 'test@example.com' });
  //   expect(error).toBeNull();
  //   expect(data).toBeDefined();
  // });
});
