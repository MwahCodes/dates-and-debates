# Mobile-First Specifications

## Rendering Strategy
- Client-side rendering only (CSR)
- No server-side rendering (SSR)
- Use React's useEffect and useState for data fetching
- Implement proper loading states
- Handle client-side routing

## Viewport Settings
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

## Mobile-Only Approach
- Design exclusively for mobile viewports
- Desktop browsers will show mobile view with black bars
- No responsive design for desktop
- Fixed viewport width of 390px (iPhone 14 Pro width)
- Center content in desktop browsers with black bars on sides

## Breakpoints
- Mobile: 0px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px and above
- Note: All designs will be mobile-first, desktop will show mobile view

## Touch Targets
- Minimum touch target size: 44x44px
- Recommended touch target size: 48x48px
- Spacing between touch targets: 8px minimum

## Mobile-Specific Considerations
### Gestures
- Swipe actions should have a minimum threshold of 20px
- Double-tap should be disabled for zooming
- Long-press actions should have a 500ms delay

### Performance
- Optimize images for mobile devices
- Use responsive images with srcset
- Implement lazy loading for images below the fold
- Minimize JavaScript execution time

### Layout
- Use CSS Grid and Flexbox for mobile layouts
- Implement safe areas for notched devices
- Consider bottom sheet patterns for mobile interactions
- Use appropriate spacing for mobile screens

## PWA Requirements
- Implement service workers for offline functionality
- Add manifest.json for installability
- Use appropriate icons for different device sizes
- Implement splash screens for iOS devices 