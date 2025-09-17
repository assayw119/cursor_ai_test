import { describe, it, expect } from 'vitest';
import { POST, PUT } from './+server';

describe('Songs API', () => {
  it('should validate required fields for POST', async () => {
    const mockRequest = {
      formData: async () => new FormData()
    } as Request;

    const response = await POST({ request: mockRequest });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
  });

  it('should validate required fields for PUT', async () => {
    const mockRequest = {
      formData: async () => new FormData()
    } as Request;

    const response = await PUT({ request: mockRequest });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
  });
});
