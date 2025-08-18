import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import navItems from '../config/navItems';

test('renders navigation links from configuration', () => {
    render(
        <MemoryRouter>
            <Sidebar />
        </MemoryRouter>
    );
    navItems.forEach((item) => {
        expect(screen.getByText(item.label)).toBeInTheDocument();
    });
});

test('highlights the active link', () => {
    render(
        <MemoryRouter initialEntries={['/sell']}>
            <Sidebar />
        </MemoryRouter>
    );
    expect(screen.getByText('Sell')).toHaveClass('bg-gray-700');
    expect(screen.getByText('Home')).not.toHaveClass('bg-gray-700');
});
