import { http, HttpResponse } from 'msw';

/**
 * MSW handlers for mocking API requests
 * Add your API endpoint handlers here
 */
export const handlers = [
  // Example: Mock a GET request
  // http.get('/api/users', () => {
  //   return HttpResponse.json([
  //     { id: '1', name: 'John Doe' },
  //     { id: '2', name: 'Jane Doe' },
  //   ]);
  // }),
];

