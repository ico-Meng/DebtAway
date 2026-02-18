# How to Work with Your Cursor AI Agent

## Quick Start Guide

Your AI agent automatically reads the `.cursorrules` file at the start of each conversation. This ensures consistency across all code generation and modifications.

## Effective Prompting Strategies

### 1. **Be Specific About Scope**
❌ "Update the app"
✅ "Create a landing page with a hero section, feature cards, and a login/signup CTA button"

### 2. **Reference the Rules**
❌ "Add a button"
✅ "Add a button following our design system with proper hover states and loading states"

### 3. **Break Down Large Tasks**
Instead of: "Build the entire dashboard"
Do this:
1. "Create the dashboard layout with left sidebar and main content area"
2. "Add navigation items to the sidebar"
3. "Build the first dashboard view (balance overview)"
4. "Add the remaining dashboard views"

### 4. **Specify Files When Relevant**
❌ "Fix the styling"
✅ "Fix the styling in `app/dashboard/page.tsx` to match our Tailwind design system"

## Example Prompts for Your Project

### Creating New Pages
```
Create a new debt summary page at /debtsummary following these requirements:
- Use the dashboard layout with sidebar
- Add SEO metadata
- Show debt cards in a responsive grid
- Use our color palette and spacing
- Make it accessible
```

### Refactoring Existing Code
```
Refactor the balance page to:
- Use TypeScript with proper interfaces
- Apply Tailwind classes consistently
- Add proper loading and error states
- Follow our component structure pattern
```

### Building Components
```
Create a reusable Card component that:
- Accepts title, description, and children props
- Uses our design system (rounded-lg, shadow-md)
- Has variants for different colors
- Is fully typed with TypeScript
- Includes proper accessibility attributes
```

### SEO Optimization
```
Add proper SEO metadata to all pages in the /app directory:
- Page titles and descriptions
- OpenGraph tags
- Twitter cards
- Structured data where appropriate
```

## What the Agent Can Do Automatically

1. ✅ Read your entire codebase
2. ✅ Make changes to multiple files at once
3. ✅ Create new components, pages, and utilities
4. ✅ Install and configure packages
5. ✅ Run commands (build, lint, test)
6. ✅ Search for patterns in your code
7. ✅ Fix linter errors
8. ✅ Optimize existing code
9. ✅ Research best practices online
10. ✅ Break down complex tasks into todos

## Best Practices for Complex Projects

### For Large Refactors
1. Start with a clear goal: "I want to migrate all pages to use our new design system"
2. Let the agent create a TODO list
3. Review the plan
4. Let the agent work through it systematically

### For New Features
1. Describe the feature end-to-end
2. Mention any specific technologies or patterns
3. Reference existing similar features if applicable
4. Specify acceptance criteria

### For Debugging
1. Describe the problem clearly
2. Share error messages if any
3. Mention what you've tried
4. The agent will investigate and fix

## Common Workflows

### Starting a New Feature
```
You: "I need to add a debt payment scheduler feature. Users should be able to:
- View upcoming payments
- Add new payment schedules
- Edit existing schedules
- See payment history
Follow our dashboard layout and design system."

Agent: [Creates TODO list, starts implementing]
```

### Improving Existing Code
```
You: "Review the pages in /app and update them to:
- Use proper TypeScript types
- Add SEO metadata
- Apply consistent Tailwind styling
- Ensure mobile responsiveness"

Agent: [Scans files, creates plan, implements changes]
```

### Quick Fixes
```
You: "Fix the TypeScript errors in the dashboard page"
Agent: [Reads file, identifies issues, fixes them]
```

## Tips for Success

### Do:
- ✅ Let the agent read files before asking about them
- ✅ Be clear about your expectations
- ✅ Allow the agent to create TODOs for complex tasks
- ✅ Review changes and provide feedback
- ✅ Ask questions if something isn't clear

### Don't:
- ❌ Assume the agent knows unstated preferences (that's why .cursorrules exists!)
- ❌ Give conflicting instructions
- ❌ Rush through complex implementations
- ❌ Forget to mention important constraints

## Iterating on Code

The agent learns from your feedback:

```
You: "The button is too small"
Agent: [Makes it larger]

You: "Good, but let's make it match the primary button style from our design system"
Agent: [Applies consistent styling]

You: "Perfect! Now add this to all forms"
Agent: [Updates all form components]
```

## When to Update .cursorrules

Update your `.cursorrules` file when you:
- Establish new design patterns
- Change technology choices
- Define new coding standards
- Add new project conventions
- Want the agent to remember specific preferences

The agent will automatically use the updated rules in new conversations!

## Advanced: Context Management

The agent has a huge context window (1M tokens) and can:
- Read dozens of files at once
- Maintain complex state across many changes
- Work through multi-step implementations
- Remember the entire conversation history

Don't worry about "overwhelming" the agent with too much information.

## Getting Help

If the agent isn't following the rules:
1. Reference the rules explicitly: "According to our .cursorrules..."
2. Ask the agent to read .cursorrules: "Check our coding standards in .cursorrules"
3. Provide specific corrections and the agent will adapt

---

**Remember**: The `.cursorrules` file is your single source of truth. Keep it updated, and your agent will consistently produce code that matches your standards!

