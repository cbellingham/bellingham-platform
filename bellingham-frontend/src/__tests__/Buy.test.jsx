import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Buy from '../components/Buy';
import { AuthContext } from '../context';
import api from '../utils/api';

vi.mock('signature_pad');

const originalGetContext = HTMLCanvasElement.prototype.getContext;

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    setTransform: vi.fn(),
    scale: vi.fn(),
  }));
});

afterAll(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext;
});

vi.mock('../utils/api');

const renderWithProviders = (ui) => {
  const logout = vi.fn();
  return render(
    <AuthContext.Provider value={{ isAuthenticated: true, logout }}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Buy component', () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url === '/api/contracts/available') {
        return Promise.resolve({
          data: {
            content: [
              {
                id: 1,
                title: 'Contract A',
                seller: 'Seller 1',
                price: 100,
                deliveryDate: '2024-01-01',
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
    api.post.mockResolvedValue({
      data: {
        id: 1,
        title: 'Contract A',
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('shows signature modal when buy button clicked', async () => {
    renderWithProviders(<Buy />);

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/contracts/available'));

    const buyButton = screen.getAllByRole('button', { name: 'Buy' })[0];
    fireEvent.click(buyButton);

    expect(await screen.findByTestId('signature-canvas')).toBeInTheDocument();
  });

  test('sends captured signature when confirming purchase', async () => {
    renderWithProviders(<Buy />);

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/api/contracts/available'));

    const buyButton = screen.getAllByRole('button', { name: 'Buy' })[0];
    fireEvent.click(buyButton);

    const saveButton = await screen.findByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/contracts/1/buy',
        { signature: 'data:image/png;base64,mock-signature' },
      );
    });
  });
});
