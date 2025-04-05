# Typography

## Primary Font: Hannari
- Font Family: 'Hannari'
- Font Weight: Regular (400)
- Font Style: Normal

## Font Sizes (Mobile-First)
- H1: 32px
- H2: 24px
- H3: 20px
- Body: 16px
- Small: 14px
- Caption: 12px

## Line Heights
- H1: 1.2
- H2: 1.3
- H3: 1.4
- Body: 1.5
- Small: 1.4
- Caption: 1.3

## Letter Spacing
- Headings: -0.5px
- Body: 0px
- Small: 0.2px

## Font Loading Strategy
```css
@font-face {
  font-family: 'Hannari';
  src: url('/fonts/Hannari-Regular.woff2') format('woff2'),
       url('/fonts/Hannari-Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
``` 