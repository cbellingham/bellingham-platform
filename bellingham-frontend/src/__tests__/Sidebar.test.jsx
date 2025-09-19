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
        const matches = screen.getAllByText(item.label);
        expect(matches.some((match) => match.getAttribute('href') === item.path)).toBe(true);
    });
});

test('renders section headings for grouped navigation', () => {
    render(
        <MemoryRouter>
            <Sidebar />
        </MemoryRouter>
    );

    const sections = [...new Set(navItems.map((item) => item.section || 'General'))];

    sections.forEach((section) => {
        const headingMatches = screen.getAllByText(section);
        expect(headingMatches.some((match) => match.tagName.toLowerCase() === 'p')).toBe(true);
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

test('shows contextual action button', () => {
    render(
        <MemoryRouter>
            <Sidebar />
        </MemoryRouter>
    );

    expect(screen.getByText('New Listing')).toBeInTheDocument();
});
