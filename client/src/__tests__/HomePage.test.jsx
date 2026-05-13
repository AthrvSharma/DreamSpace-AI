import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import useAuthStore from '../store/authStore';

// Mock the AuthStore
vi.mock('../store/authStore', () => ({
    default: vi.fn(() => ({
        user: null
    }))
}));

describe('HomePage (Integration Test)', () => {
    it('renders the hero section correctly', () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        // Check if main heading is present
        const heading = screen.getByText(/Reimagine your/i);
        expect(heading).toBeInTheDocument();

        // Check if CTA buttons exist
        const ctaBtn = screen.getByText(/Start Designing Free/i);
        expect(ctaBtn).toBeInTheDocument();
        
        const demoBtn = screen.getByText(/Watch Demo/i);
        expect(demoBtn).toBeInTheDocument();
    });

    it('renders all feature highlights', () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );

        // Expect features to be rendered on page
        expect(screen.getAllByText('Upload Photo')[0]).toBeInTheDocument();
        expect(screen.getAllByText('AI Redesign')[0]).toBeInTheDocument();
        expect(screen.getAllByText('3D Studio')[0]).toBeInTheDocument();
        expect(screen.getAllByText('AR Preview')[0]).toBeInTheDocument();
    });
});
