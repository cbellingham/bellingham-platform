import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import navItems from '../config/navItems';
import { AuthContext } from '../context';

const renderSidebar = (initialEntries = ['/']) =>
    render(
        <MemoryRouter initialEntries={initialEntries}>
            <AuthContext.Provider
                value={{
                    permissions: ['BUY', 'SELL'],
                    role: 'ROLE_ADMIN',
                }}
            >
                <Sidebar />
            </AuthContext.Provider>
        </MemoryRouter>
    );

test('renders navigation links from configuration', () => {
    renderSidebar();
    navItems.forEach((item) => {
        const matches = screen.getAllByText(item.label);
        expect(matches.some((match) => match.closest('a')?.getAttribute('href') === item.path)).toBe(true);
    });
});

test('renders section headings for grouped navigation', () => {
    renderSidebar();

    const sections = [...new Set(navItems.map((item) => item.section || 'General'))];

    sections.forEach((section) => {
        const headingMatches = screen.getAllByText(section);
        expect(headingMatches.some((match) => match.tagName.toLowerCase() === 'p')).toBe(true);
    });
});

test('highlights the active link', () => {
    renderSidebar(['/sell']);
    expect(screen.getByRole('link', { name: 'Sell' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current', 'page');
});

test('shows contextual action button', () => {
    renderSidebar();

    expect(screen.getByText('Create Listing')).toBeInTheDocument();
});
