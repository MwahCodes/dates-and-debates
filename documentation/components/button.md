# Button Component (shadcn/ui)

## Implementation
- Use shadcn/ui Button component
- Customize with our design system colors
- Extend with additional variants as needed

## Base Configuration
```tsx
import { Button } from "@/components/ui/button"

// Example usage
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## Custom Variants
### Primary Button
- Extend shadcn/ui Button with our primary color
- Background: #6C0002
- Text Color: #FFFFFF
- Border: None
- Padding: 12px 24px
- Border Radius: 8px
- Shadow: Small shadow (0 2px 4px rgba(0, 0, 0, 0.1))

### Secondary Button
- Background: #FFFFFF
- Text Color: #6C0002
- Border: 1px solid #6C0002
- Padding: 12px 24px
- Border Radius: 8px

### Text Button
- Background: Transparent
- Text Color: #6C0002
- Border: None
- Padding: 12px 24px

## States
### Default
- Opacity: 100%
- Shadow: As specified above

### Hover
- Primary: Darken background by 10%
- Secondary: Lighten background by 5%
- Text: Underline text

### Active
- Scale: 0.98
- Shadow: Remove shadow

### Disabled
- Opacity: 50%
- Cursor: not-allowed

## Mobile Considerations
- Minimum touch target: 44x44px
- Add touch feedback
- Consider haptic feedback for important actions
- Ensure proper spacing for mobile screens

## Accessibility
- Include proper ARIA labels
- Ensure sufficient color contrast
- Support keyboard navigation
- Provide focus states

## Implementation Notes
- All components are client-side rendered
- Use React's useState for state management
- Implement proper loading states
- Handle mobile-specific interactions 