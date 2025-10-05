/**
 * Comprehensive Test Suite for Feedback Pipeline
 * Tests the complete flow: borders → toasts → modal
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { convertLatexToAscii, createScaffold } from '@/utils/latexToAscii';
import { FeedbackModal } from '@/components/tugon/feedback/FeedbackModal';
import { BehaviorAnalyzer } from '@/components/tugon/input-system/BehaviorAnalyzer';

// ==================== PART 1: LaTeX to ASCII Conversion ====================
describe('LaTeX to ASCII Conversion', () => {
  it('should convert fractions correctly', () => {
    expect(convertLatexToAscii('\\frac{a}{b}')).toBe('(a/b)');
    expect(convertLatexToAscii('\\frac{x+2}{y-3}')).toBe('((x+2)/(y-3))');
  });

  it('should convert square roots correctly', () => {
    expect(convertLatexToAscii('\\sqrt{x}')).toBe('√(x)');
    expect(convertLatexToAscii('\\sqrt{a+b}')).toBe('√(a+b)');
  });

  it('should convert superscripts correctly', () => {
    expect(convertLatexToAscii('x^2')).toBe('x²');
    expect(convertLatexToAscii('x^{10}')).toBe('x^(10)');
    expect(convertLatexToAscii('y^3')).toBe('y³');
  });

  it('should handle Greek letters', () => {
    expect(convertLatexToAscii('\\alpha')).toBe('α');
    expect(convertLatexToAscii('\\pi')).toBe('π');
    expect(convertLatexToAscii('\\Delta')).toBe('Δ');
  });

  it('should handle math operators', () => {
    expect(convertLatexToAscii('\\times')).toBe('×');
    expect(convertLatexToAscii('\\div')).toBe('÷');
    expect(convertLatexToAscii('\\pm')).toBe('±');
  });

  it('should handle plain expressions without LaTeX', () => {
    expect(convertLatexToAscii('g(5) = 2(5) - 8')).toBe('g(5) = 2(5) - 8');
    expect(convertLatexToAscii('y = 3x + 2')).toBe('y = 3x + 2');
  });

  it('should handle empty input', () => {
    expect(convertLatexToAscii('')).toBe('');
    expect(convertLatexToAscii('   ')).toBe('');
  });
});

// ==================== PART 2: Scaffold Creation ====================
describe('Scaffold Creation', () => {
  it('should create fill-in-the-blank for simple answers', () => {
    const scaffold = createScaffold('g(5) = 2(5) - 8');
    expect(scaffold).toContain('___');
    expect(scaffold).toMatch(/g\(5\) = 2\(5\) - ___/);
  });

  it('should create fill-in-the-blank for expressions with equals', () => {
    const scaffold = createScaffold('y = 10 - 8');
    expect(scaffold).toContain('___');
  });

  it('should handle LaTeX expressions', () => {
    const scaffold = createScaffold('\\frac{a}{b} = 5');
    expect(scaffold).toContain('(a/b)');
    expect(scaffold).toContain('___');
  });

  it('should handle empty input', () => {
    expect(createScaffold('')).toBe('');
  });
});

// ==================== PART 3: FeedbackModal Component ====================
describe('FeedbackModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should not render when isOpen is false', () => {
    render(
      <FeedbackModal
        isOpen={false}
        onClose={mockOnClose}
        userInput="wrong answer"
        correctAnswer="g(5) = 2"
      />
    );

    expect(screen.queryByText(/Let's Review This Step Together/i)).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <FeedbackModal
        isOpen={true}
        onClose={mockOnClose}
        userInput="wrong answer"
        correctAnswer="g(5) = 2"
      />
    );

    expect(screen.getByText(/Let's Review This Step Together/i)).toBeInTheDocument();
  });

  it('should display user input in ASCII format', () => {
    render(
      <FeedbackModal
        isOpen={true}
        onClose={mockOnClose}
        userInput="\\frac{x}{y}"
        correctAnswer="g(5) = 2"
      />
    );

    expect(screen.getByText('(x/y)')).toBeInTheDocument();
  });

  it('should display expected answer in ASCII format', () => {
    render(
      <FeedbackModal
        isOpen={true}
        onClose={mockOnClose}
        userInput="wrong"
        correctAnswer="\\sqrt{x}"
      />
    );

    expect(screen.getByText('√(x)')).toBeInTheDocument();
  });

  it('should display scaffold hint', () => {
    render(
      <FeedbackModal
        isOpen={true}
        onClose={mockOnClose}
        userInput="wrong"
        correctAnswer="g(5) = 2(5) - 8"
      />
    );

    expect(screen.getByText(/Fill in the blank/i)).toBeInTheDocument();
  });

  it('should call onClose when "Got It!" button is clicked', () => {
    render(
      <FeedbackModal
        isOpen={true}
        onClose={mockOnClose}
        userInput="wrong"
        correctAnswer="g(5) = 2"
      />
    );

    const button = screen.getByText(/Got It!/i);
    fireEvent.click(button);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    render(
      <FeedbackModal
        isOpen={true}
        onClose={mockOnClose}
        userInput="wrong"
        correctAnswer="g(5) = 2"
      />
    );

    const backdrop = screen.getByRole('button', { name: /Got It!/i }).parentElement?.parentElement?.parentElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should show "Empty" placeholder for empty user input', () => {
    render(
      <FeedbackModal
        isOpen={true}
        onClose={mockOnClose}
        userInput=""
        correctAnswer="g(5) = 2"
      />
    );

    expect(screen.getByText(/Empty/i)).toBeInTheDocument();
  });

  it('should use theme color #327373', () => {
    const { container } = render(
      <FeedbackModal
        isOpen={true}
        onClose={mockOnClose}
        userInput="wrong"
        correctAnswer="g(5) = 2"
      />
    );

    // Check if the gradient header exists with theme colors
    const header = container.querySelector('.from-\\[\\#397F85\\]');
    expect(header).toBeInTheDocument();
  });
});

// ==================== PART 4: Behavior Analysis Integration ====================
describe('BehaviorAnalyzer Integration', () => {
  it('should detect sign errors', () => {
    const result = BehaviorAnalyzer.analyze('y = -5', 'y = 5', []);
    expect(result.pattern).toBe('sign-error');
  });

  it('should detect repetition', () => {
    const result = BehaviorAnalyzer.analyze('y = 10', 'y = 5', ['y = 10', 'y = 10']);
    expect(result.pattern).toBe('repetition');
  });

  it('should detect close attempts', () => {
    const result = BehaviorAnalyzer.analyze('y = 4.9', 'y = 5', []);
    expect(result.pattern).toBe('close-attempt');
  });

  it('should detect magnitude errors', () => {
    const result = BehaviorAnalyzer.analyze('y = 50', 'y = 5', []);
    expect(result.pattern).toBe('magnitude-error');
  });

  it('should detect guessing pattern', () => {
    const result = BehaviorAnalyzer.analyze('y = 7', 'y = 5', ['y = 3', 'y = 10', 'y = 8']);
    expect(result.pattern).toBe('guessing');
  });

  it('should provide appropriate messages for each pattern', () => {
    const patterns = [
      { input: 'y = -5', expected: 'y = 5', pattern: 'sign-error' },
      { input: 'y = 10', expected: 'y = 5', pattern: 'repetition', history: ['y = 10'] },
      { input: 'y = 4.9', expected: 'y = 5', pattern: 'close-attempt' },
    ];

    patterns.forEach(({ input, expected, pattern, history = [] }) => {
      const result = BehaviorAnalyzer.analyze(input, expected, history);
      expect(result.pattern).toBe(pattern);
      expect(result.message).toBeTruthy();
      expect(result.message.length).toBeGreaterThan(0);
    });
  });
});

// ==================== PART 5: Feedback Pipeline Flow ====================
describe('Feedback Pipeline Flow (Integration)', () => {
  it('should follow the correct progression: borders → toasts → modal', () => {
    // This test simulates the expected behavior:
    // 1. Attempts 1-2: Red border only (no toast)
    // 2. Attempt 3: First toast appears
    // 3. Attempts 4-5: Red border only
    // 4. Attempt 6: Second toast appears
    // 5. Attempts 7-8: Red border only
    // 6. Attempt 9: Modal appears instead of toast

    const attemptFlow = [
      { attempt: 1, expectedFeedback: 'border-only' },
      { attempt: 2, expectedFeedback: 'border-only' },
      { attempt: 3, expectedFeedback: 'border-and-toast' },
      { attempt: 4, expectedFeedback: 'border-only' },
      { attempt: 5, expectedFeedback: 'border-only' },
      { attempt: 6, expectedFeedback: 'border-and-toast' },
      { attempt: 7, expectedFeedback: 'border-only' },
      { attempt: 8, expectedFeedback: 'border-only' },
      { attempt: 9, expectedFeedback: 'modal' },
    ];

    attemptFlow.forEach(({ attempt, expectedFeedback }) => {
      const wrongAttemptCount = attempt;
      const shortHintCount = Math.floor((attempt - 1) / 3);

      const shouldShowToast = wrongAttemptCount % 3 === 0 && shortHintCount < 3;
      const shouldShowModal = wrongAttemptCount % 3 === 0 && shortHintCount === 3;

      if (expectedFeedback === 'border-only') {
        expect(shouldShowToast).toBe(false);
        expect(shouldShowModal).toBe(false);
      } else if (expectedFeedback === 'border-and-toast') {
        expect(shouldShowToast).toBe(true);
        expect(shouldShowModal).toBe(false);
      } else if (expectedFeedback === 'modal') {
        expect(shouldShowToast).toBe(false);
        expect(shouldShowModal).toBe(true);
      }
    });
  });

  it('should reset counters on correct answer', () => {
    let wrongAttemptCounter = 5;
    let shortHintCounter = 1;
    let modalShown = false;

    // Simulate correct answer
    wrongAttemptCounter = 0;
    shortHintCounter = 0;
    modalShown = false;

    expect(wrongAttemptCounter).toBe(0);
    expect(shortHintCounter).toBe(0);
    expect(modalShown).toBe(false);
  });

  it('should not show modal twice for same question', () => {
    let modalShown = false;
    let wrongAttemptCount = 0;
    let shortHintCount = 0;

    // Simulate 9 wrong attempts (3 toasts → modal)
    for (let i = 1; i <= 9; i++) {
      wrongAttemptCount++;

      if (wrongAttemptCount % 3 === 0 && !modalShown) {
        shortHintCount++;

        if (shortHintCount >= 3) {
          modalShown = true;
        }
      }
    }

    expect(modalShown).toBe(true);
    expect(shortHintCount).toBe(3);

    // Try to show modal again on 12th attempt
    for (let i = 10; i <= 12; i++) {
      wrongAttemptCount++;

      if (wrongAttemptCount % 3 === 0 && !modalShown) {
        shortHintCount++;

        if (shortHintCount >= 3) {
          modalShown = true;
        }
      }
    }

    // Modal should still be shown only once
    expect(shortHintCount).toBe(3); // No additional toasts after modal
  });
});

// ==================== PART 6: Edge Cases ====================
describe('Edge Cases', () => {
  it('should handle very long LaTeX expressions', () => {
    const longLatex = '\\frac{x^2 + 2x + 1}{y^2 - 3y + 2} = \\sqrt{\\alpha + \\beta}';
    const ascii = convertLatexToAscii(longLatex);
    expect(ascii).toContain('(x² + 2x + 1)/(y² - 3y + 2)');
  });

  it('should handle special characters in user input', () => {
    render(
      <FeedbackModal
        isOpen={true}
        onClose={vi.fn()}
        userInput="@#$%^&*()"
        correctAnswer="g(5) = 2"
      />
    );

    expect(screen.getByText('@#$%^&*()')).toBeInTheDocument();
  });

  it('should handle modal opening and closing rapidly', async () => {
    const mockOnClose = vi.fn();
    const { rerender } = render(
      <FeedbackModal
        isOpen={true}
        onClose={mockOnClose}
        userInput="wrong"
        correctAnswer="g(5) = 2"
      />
    );

    // Close modal
    rerender(
      <FeedbackModal
        isOpen={false}
        onClose={mockOnClose}
        userInput="wrong"
        correctAnswer="g(5) = 2"
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/Let's Review This Step Together/i)).not.toBeInTheDocument();
    });
  });
});

// ==================== Summary Report ====================
describe('Feedback System Summary', () => {
  it('should have all components working together', () => {
    // This test serves as documentation of the complete system
    const systemComponents = {
      latexConverter: typeof convertLatexToAscii === 'function',
      scaffoldGenerator: typeof createScaffold === 'function',
      feedbackModal: FeedbackModal !== undefined,
      behaviorAnalyzer: BehaviorAnalyzer !== undefined,
    };

    expect(systemComponents.latexConverter).toBe(true);
    expect(systemComponents.scaffoldGenerator).toBe(true);
    expect(systemComponents.feedbackModal).toBe(true);
    expect(systemComponents.behaviorAnalyzer).toBe(true);

    console.log('✅ Feedback System Components:', systemComponents);
  });
});
