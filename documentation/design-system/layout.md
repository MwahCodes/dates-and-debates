# Layout Guidelines

## Page Structure
- All pages follow a consistent layout structure
- Title section is fixed at the top of the page
- Content section starts below with appropriate spacing
- Horizontal centering for all content
- Consistent padding across pages

## Spacing
- Top padding from viewport: 3rem (48px)
- Side padding: 2rem (32px)
- Content max-width: 28rem (448px)
- Space between title and content: 2rem (32px)
- Space between form elements: 1.5rem (24px)

## Title Section
- Always positioned at the top
- Centered horizontally
- Includes main title and optional subtitle
- Uses consistent font sizes and colors

## Content Section
- Starts below title with fixed spacing
- Horizontally centered
- Responsive width (max-width for larger screens)
- Maintains consistent spacing between elements

## Example Structure
```jsx
<div className="min-h-screen bg-white">
  {/* Fixed title section */}
  <div className="w-full pt-12 px-8">
    <h1 className="text-3xl font-semibold text-center text-[#1A1A1A]">
      Page Title
    </h1>
    <p className="mt-2 text-center text-[#666666]">
      Optional subtitle text
    </p>
  </div>

  {/* Content section */}
  <div className="px-8 mt-8">
    <div className="max-w-md mx-auto space-y-6">
      {/* Page content */}
    </div>
  </div>
</div>
``` 