// Test file to verify step placeholder functionality
import { getAnswerForQuestion } from '../../data/answers/index';

export function testStepPlaceholders(): void {
  console.log('=== Testing Step Placeholders ===');
  
  // Test Topic 1, Category 2 (the one we just updated)
  const steps = getAnswerForQuestion(1, 2, 2); // Question 2: g(5) problem
  
  if (!steps) {
    console.error('❌ No steps found for Topic 1, Category 2, Question 2');
    return;
  }
  
  console.log('✅ Steps found:', steps.length);
  
  steps.forEach((step, index) => {
    console.log(`\nStep ${index + 1}:`);
    console.log(`  Label: ${step.label}`);
    console.log(`  Answer: ${step.answer}`);
    console.log(`  Placeholder: ${step.placeholder || 'No placeholder (will use fallback)'}`);
    
    // Verify placeholder exists
    if (step.placeholder) {
      console.log(`  ✅ Has custom placeholder`);
    } else {
      console.log(`  ⚠️ No placeholder - will use fallback: "Enter your expression here..."`);
    }
  });
  
  console.log('\n=== Expected Behavior ===');
  console.log('1. Math-field should show placeholder when empty');
  console.log('2. Placeholder should disappear when typing starts');
  console.log('3. Placeholder should reappear when field is cleared');
  console.log('4. Each step should show specific guidance text');
  
  console.log('\n=== Test Complete ===');
}

// Test the getStepPlaceholder logic
export function testPlaceholderLogic(): void {
  console.log('\n=== Testing Placeholder Logic ===');
  
  const mockSteps = [
    { label: "choose" as const, answer: "g(x) = 2x - 8", placeholder: "Pick the correct case for x = 5" },
    { label: "substitution" as const, answer: "g(5) = 2(5) - 8", placeholder: "Substitute 5 into the chosen expression" },
    { label: "evaluation" as const, answer: "g(5) = 10 - 8" }, // No placeholder
    { label: "final" as const, answer: "g(5) = 2", placeholder: "Write the final result clearly" }
  ];
  
  // Simulate the getStepPlaceholder function logic
  function getStepPlaceholder(lineIndex: number): string {
    if (lineIndex >= mockSteps.length) {
      return "Enter your expression here..."; // Generic fallback
    }
    
    const step = mockSteps[lineIndex];
    return step.placeholder || "Enter your expression here..."; // Use step placeholder or fallback
  }
  
  mockSteps.forEach((step, index) => {
    const placeholder = getStepPlaceholder(index);
    console.log(`Step ${index + 1} (${step.label}): "${placeholder}"`);
  });
  
  // Test out-of-bounds
  const outOfBounds = getStepPlaceholder(10);
  console.log(`Out of bounds step: "${outOfBounds}"`);
  
  console.log('\n✅ Placeholder logic test complete');
}