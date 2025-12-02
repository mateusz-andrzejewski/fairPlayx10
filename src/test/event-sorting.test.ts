import { describe, it, expect, vi } from "vitest";
import { createEventService } from "../lib/services/event.service";
import type { SupabaseClient } from "../db/supabase.client";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      is: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() => ({
            eq: vi.fn(() => ({
              ilike: vi.fn(() => ({
                gte: vi.fn(() => ({
                  lte: vi.fn(() => ({
                    select: vi.fn(() => ({
                      count: vi.fn(),
                    })),
                  })),
                })),
              })),
            })),
          })),
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        lt: vi.fn(() => ({
          is: vi.fn(() => ({
            select: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          })),
        })),
      })),
    })),
  })),
} as unknown as SupabaseClient;

describe("EventService - listEvents sorting", () => {
  it("should sort events by event_datetime in descending order (newest first)", async () => {
    const eventService = createEventService(mockSupabase);

    // Mock the query chain to capture the order call
    const mockOrder = vi.fn().mockReturnValue({
      range: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          ilike: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                  count: 0,
                }),
              }),
            }),
          }),
        }),
      }),
    });

    // Mock the from() call for listEvents
    (mockSupabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        is: vi.fn().mockReturnValue({
          order: mockOrder,
        }),
      }),
    });

    // Call listEvents with minimal params, skipping autoCompleteEvents
    await eventService.listEvents(
      {
        page: 1,
        limit: 10,
      },
      true
    );

    // Verify that order was called with descending: false (ascending: false means descending)
    expect(mockOrder).toHaveBeenCalledWith("event_datetime", { ascending: false });
  });
});
