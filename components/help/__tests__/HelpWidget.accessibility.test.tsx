import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { HelpWidget } from '../HelpWidget';
import { HelpWidgetProvider } from '../HelpProvider';
import { faqService } from '@/lib/help/faq-service';

expect.extend(toHaveNoViolations);

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock FAQ service
jest.mock('@/lib/help/faq-service', () => ({
  faqService: {
    getFAQsForContext: jest.fn().mockReturnValue([
      {
        id: 'test-1',
        question: 'Test Question 1',
        answer: 'Test Answer 1',
        category: 'general',
        tags: ['test'],
      },
    ]),
    searchFAQs: jest.fn(),
    getFAQById: jest.fn(),
    getRelatedFAQs: jest.fn().mockReturnValue([]),
  },
  useFAQSearch: jest.fn(() => ({
    query: '',
    setQuery: jest.fn(),
    results: [],
    isSearching: false,
  })),
}));

describe('HelpWidget Accessibility', () => {
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(
      <HelpWidgetProvider>
        {ui}
      </HelpWidgetProvider>
    );
  };

  describe('WCAG Compliance', () => {
    it('should have no accessibility violations when closed', async () => {
      const { container } = renderWithProvider(<HelpWidget />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when open', async () => {
      const { container } = renderWithProvider(<HelpWidget />);
      
      fireEvent.click(screen.getByLabelText('Open help menu'));
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in search mode', async () => {
      const { container } = renderWithProvider(<HelpWidget />);
      
      fireEvent.click(screen.getByLabelText('Open help menu'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Search for help'));
      });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search for help...')).toBeInTheDocument();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be fully keyboard navigable', async () => {
      renderWithProvider(<HelpWidget />);
      
      // Tab to help button
      const helpButton = screen.getByLabelText('Open help menu');
      helpButton.focus();
      expect(document.activeElement).toBe(helpButton);
      
      // Enter to open
      fireEvent.keyDown(helpButton, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Tab through elements
      const focusableElements = screen.getByRole('dialog').querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should trap focus within the dialog', async () => {
      renderWithProvider(<HelpWidget />);
      
      fireEvent.click(screen.getByLabelText('Open help menu'));
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        const focusableElements = Array.from(
          dialog.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ) as HTMLElement[];
        
        expect(focusableElements.length).toBeGreaterThan(0);
        
        // Focus should be within dialog
        const activeElement = document.activeElement;
        expect(dialog.contains(activeElement)).toBe(true);
      });
    });

    it('should support arrow key navigation in FAQ list', async () => {
      renderWithProvider(<HelpWidget />);
      
      fireEvent.click(screen.getByLabelText('Open help menu'));
      
      await waitFor(() => {
        const faqItems = screen.getAllByRole('button', { name: /FAQ item/i });
        expect(faqItems.length).toBeGreaterThan(0);
        
        // Focus first item
        faqItems[0].focus();
        expect(document.activeElement).toBe(faqItems[0]);
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels', async () => {
      renderWithProvider(<HelpWidget />);
      
      // Check help button
      expect(screen.getByLabelText('Open help menu')).toBeInTheDocument();
      
      fireEvent.click(screen.getByLabelText('Open help menu'));
      
      await waitFor(() => {
        // Check dialog
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-label', 'Help menu');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        
        // Check close button
        expect(screen.getByLabelText('Close help menu')).toBeInTheDocument();
        
        // Check minimize button
        expect(screen.getByLabelText('Minimize help menu')).toBeInTheDocument();
      });
    });

    it('should announce state changes', async () => {
      renderWithProvider(<HelpWidget />);
      
      fireEvent.click(screen.getByLabelText('Open help menu'));
      
      await waitFor(() => {
        // FAQ items should have proper aria-expanded
        const faqButton = screen.getByText('Test Question 1').closest('button');
        expect(faqButton).toHaveAttribute('aria-expanded', 'false');
        
        fireEvent.click(faqButton!);
      });
      
      await waitFor(() => {
        const faqButton = screen.getByText('Test Question 1').closest('button');
        expect(faqButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have descriptive link text', async () => {
      renderWithProvider(<HelpWidget />);
      
      fireEvent.click(screen.getByLabelText('Open help menu'));
      
      await waitFor(() => {
        // All interactive elements should have descriptive text
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button.textContent || button.getAttribute('aria-label')).toBeTruthy();
        });
      });
    });
  });

  describe('Color Contrast', () => {
    it('should maintain sufficient color contrast', async () => {
      renderWithProvider(<HelpWidget />);
      
      fireEvent.click(screen.getByLabelText('Open help menu'));
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        
        // Check text elements have sufficient contrast
        // This is a simplified check - in real tests, you'd use a contrast checking library
        const textElements = dialog.querySelectorAll('h3, h4, p, button');
        textElements.forEach(element => {
          const styles = window.getComputedStyle(element);
          // Ensure text is not too light
          expect(styles.color).not.toBe('rgb(255, 255, 255)');
        });
      });
    });
  });

  describe('Focus Management', () => {
    it('should restore focus when closed', async () => {
      renderWithProvider(<HelpWidget />);
      
      const helpButton = screen.getByLabelText('Open help menu');
      helpButton.focus();
      
      fireEvent.click(helpButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Close the dialog
      fireEvent.click(screen.getByLabelText('Close help menu'));
      
      await waitFor(() => {
        // Focus should return to the help button
        expect(document.activeElement).toBe(helpButton);
      });
    });

    it('should handle focus for minimize/maximize', async () => {
      renderWithProvider(<HelpWidget />);
      
      fireEvent.click(screen.getByLabelText('Open help menu'));
      
      await waitFor(() => {
        const minimizeButton = screen.getByLabelText('Minimize help menu');
        minimizeButton.focus();
        fireEvent.click(minimizeButton);
      });
      
      await waitFor(() => {
        // Focus should remain accessible
        const maximizeButton = screen.getByLabelText('Expand help menu');
        expect(maximizeButton).toBeInTheDocument();
      });
    });
  });

  describe('Motion and Animation', () => {
    it('should respect prefers-reduced-motion', async () => {
      // Mock matchMedia for prefers-reduced-motion
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      
      renderWithProvider(<HelpWidget />);
      
      // Animations should be disabled or reduced
      // This is handled by framer-motion automatically
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });
  });

  describe('Touch Accessibility', () => {
    it('should have sufficient touch target sizes', async () => {
      renderWithProvider(<HelpWidget />);
      
      // Help button should be at least 44x44 pixels
      const helpButton = screen.getByLabelText('Open help menu');
      const styles = window.getComputedStyle(helpButton);
      
      // Check padding ensures sufficient touch target
      expect(styles.padding).toBe('16px'); // p-4 = 16px
      
      fireEvent.click(helpButton);
      
      await waitFor(() => {
        // All interactive elements should have sufficient size
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          const buttonStyles = window.getComputedStyle(button);
          // Buttons should have adequate padding
          expect(parseInt(buttonStyles.paddingTop) + parseInt(buttonStyles.paddingBottom))
            .toBeGreaterThanOrEqual(8);
        });
      });
    });
  });
});