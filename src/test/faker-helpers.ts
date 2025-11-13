import { faker } from "@faker-js/faker";

/**
 * Helper functions for generating test data with Faker
 * These can be used across your test suite for consistent, realistic test data
 */

export const generateUser = () => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  role: faker.helpers.arrayElement(["admin", "user", "moderator"]),
  createdAt: faker.date.past().toISOString(),
});

export const generatePlayer = () => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  position: faker.helpers.arrayElement(["GK", "DEF", "MID", "ATT"]),
  skillLevel: faker.number.int({ min: 1, max: 10 }),
  createdAt: faker.date.past().toISOString(),
});

export const generateEvent = () => ({
  id: faker.string.uuid(),
  name: faker.company.catchPhrase(),
  location: faker.location.streetAddress(),
  date: faker.date.future().toISOString(),
  maxPlayers: faker.number.int({ min: 10, max: 30 }),
  status: faker.helpers.arrayElement(["draft", "open", "closed", "completed"]),
  createdAt: faker.date.past().toISOString(),
});

export const generateEventSignup = () => ({
  id: faker.string.uuid(),
  eventId: faker.string.uuid(),
  playerId: faker.string.uuid(),
  status: faker.helpers.arrayElement(["pending", "confirmed", "cancelled"]),
  createdAt: faker.date.past().toISOString(),
});

export const generateTeamAssignment = () => ({
  id: faker.string.uuid(),
  eventId: faker.string.uuid(),
  playerId: faker.string.uuid(),
  teamNumber: faker.number.int({ min: 1, max: 4 }),
  teamColor: faker.helpers.arrayElement(["red", "blue", "green", "yellow"]),
});

/**
 * Generate an array of items using a generator function
 */
export const generateMany = <T>(generator: () => T, count: number): T[] => {
  return Array.from({ length: count }, generator);
};

/**
 * Set a deterministic seed for reproducible test data
 */
export const setSeed = (seed: number) => {
  faker.seed(seed);
};
