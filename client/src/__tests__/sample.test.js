import { describe, it, expect } from 'vitest';

describe('Project Test Suite', () => {
    it('shows that testing works here', () => {
        const testingWorks = true;
        expect(testingWorks).toBe(true);
    });

    it('can perform basic assertions', () => {
        expect(1 + 1).toBe(2);
        expect('DreamSpace AI').toContain('DreamSpace');
    });
});
