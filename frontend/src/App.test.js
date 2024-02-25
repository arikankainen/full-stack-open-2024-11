import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('<App />', () => {
    it('should render', () => {
        render(<App />);

        const element = screen.getByText('filter shown with');
        expect(element).toBeDefined();
    });
});
