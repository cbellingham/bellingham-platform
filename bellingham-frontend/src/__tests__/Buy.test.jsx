import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Buy from '../components/Buy';
import { AuthContext } from '../context';
import api from '../utils/api';

vi.mock('../utils/api');

const renderWithProviders = (ui) => {
  const logout = vi.fn();
  return render(
    <AuthContext.Provider value={{ token: 'token', logout }}>
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
});
