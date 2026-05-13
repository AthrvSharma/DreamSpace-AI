import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver for JSDOM
const IntersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
}));
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
