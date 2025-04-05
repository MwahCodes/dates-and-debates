# Components Documentation

## shadcn/ui Implementation

### Setup
1. Install shadcn/ui CLI:
```bash
npm install -D @shadcn/ui
```

2. Initialize shadcn/ui:
```bash
npx shadcn-ui@latest init
```

3. Configure with our design system:
```json
{
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Component Usage
- All components are client-side rendered
- Use React's useState and useEffect for state management
- Implement proper loading states
- Handle mobile-specific interactions

### Available Components
- Button
- Card
- Input
- Select
- Dialog
- Sheet
- Tabs
- Toast
- And more...

### Customization
- Extend base components with our design system
- Maintain mobile-first approach
- Ensure proper touch targets
- Implement accessibility features

### Best Practices
1. Always use client-side rendering
2. Implement proper loading states
3. Handle mobile gestures
4. Ensure proper touch targets
5. Maintain accessibility standards
6. Use proper state management
7. Implement error boundaries
8. Handle offline states

### Mobile-Specific Components
- Bottom Sheet
- Swipeable Cards
- Touch Feedback
- Gesture Handlers
- Mobile Navigation
- Mobile Forms 