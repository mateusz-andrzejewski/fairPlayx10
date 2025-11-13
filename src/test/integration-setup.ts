import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { beforeAll, afterAll } from "vitest";

/**
 * Integration test setup with PostgreSQL Testcontainer
 *
 * Usage:
 * 1. Import this file in your integration tests
 * 2. Access the container via getDbContainer() or getConnectionString()
 * 3. The container will be automatically started before tests and stopped after
 *
 * Note: Requires Docker to be running on your machine
 */

let postgresContainer: StartedPostgreSqlContainer;

export const getDbContainer = () => postgresContainer;

export const getConnectionString = () => {
  if (!postgresContainer) {
    throw new Error("Database container not initialized");
  }
  return postgresContainer.getConnectionUri();
};

beforeAll(async () => {
  // Start PostgreSQL container before all integration tests
  postgresContainer = await new PostgreSqlContainer("postgres:15-alpine")
    .withDatabase("test_db")
    .withUsername("test_user")
    .withPassword("test_password")
    .start();

  console.log("PostgreSQL container started:", postgresContainer.getConnectionUri());
}, 60000); // 60 second timeout for container startup

afterAll(async () => {
  // Stop and cleanup container after all tests
  if (postgresContainer) {
    await postgresContainer.stop();
    console.log("PostgreSQL container stopped");
  }
});
