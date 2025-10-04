# Media Gallery Embla - Animation Features

## Overview
The product media gallery includes comprehensive animations and smooth transitions for an enhanced user experience.

## Animation Features

### 1. **Thumbnail Animations**

#### On Load
- **Stagger Fade-In**: Thumbnails fade in sequentially with a slight upward motion
- Delay increases for each thumbnail (0.05s increments)
- Creates a smooth, professional loading experience

#### On Click
- **Ripple Effect**: Material Design-inspired ripple expands from click point
- **Pulse Animation**: Active thumbnail briefly pulses to confirm selection
- **Click Animation**: Brief scale-down effect for tactile feedback

#### On Hover
- **Scale Up**: Thumbnails grow slightly (1.05x)
- **Border Highlight**: Border becomes more visible
- **Badge Scale**: Play/3D icons scale up on hover

#### Active State
- **Border Highlight**: Distinct border color for active thumbnail
- **Inner Scale**: Slight scale transform on the thumbnail content (1.02x)
- **Pulse on Activation**: Brief pulse when thumbnail becomes active

### 2. **Main Carousel Animations**

#### Slide Transitions
- **Fade In**: Images fade in smoothly when loaded
- **Slide In**: Active slide animates in with opacity and scale
- **Smooth Scrolling**: Cubic bezier easing (0.25, 1, 0.5, 1) for natural movement

#### Dragging
- **Cursor Change**: Changes to grabbing cursor during drag
- **Transition Removal**: Removes transition during drag for immediate response
- **Smooth Release**: Re-enables transitions when drag ends

### 3. **Navigation Button Animations**

#### Hover Effects
- **Scale Up**: Buttons grow to 1.08x on hover
- **Maintains Rotation**: Previous buttons maintain their rotation while scaling
- **Smooth Transition**: 0.25s cubic bezier easing

#### Click Animation
- **Scale Down**: Brief scale to 0.95x for tactile feedback
- **200ms Duration**: Quick response time

#### Disabled State
- **Fade Out**: Smooth opacity transition to 0.3
- **No Hover**: Disabled buttons don't respond to hover

### 4. **Counter Animation**

#### Update Animation
- **Scale Pulse**: Counter number briefly scales to 1.15x on change
- **300ms Duration**: Quick, noticeable change
- **Smooth Easing**: Ease-out for natural motion

### 5. **Loading States**

#### Image Loading
- **Shimmer Effect**: Animated gradient background while loading
- **Continuous Loop**: 2s infinite shimmer animation
- **Subtle Gradient**: Light foreground color gradient

#### Lazy Loading
- **Background Color**: Light gray background for lazy-loaded images
- **Fade In**: Images fade in once loaded

### 6. **Accessibility Features**

#### Focus States
- **Pulse Animation**: Focus outline pulses to draw attention
- **1s Infinite Loop**: Continuous pulse while focused
- **High Contrast**: Maintains visibility

#### Reduced Motion
- **Respects User Preference**: All animations disabled with `prefers-reduced-motion`
- **Instant Transitions**: No animation delays for accessibility
- **Immediate Visibility**: Thumbnails appear instantly

### 7. **Carousel Synchronization**

#### Auto-Scroll
- **Smart Scrolling**: Thumbnails auto-scroll to keep active thumbnail visible
- **View Detection**: Only scrolls if active thumbnail is out of view
- **Smooth Navigation**: Coordinated movement between main and thumbnail carousels

## Technical Details

### Easing Functions Used
- **Cubic Bezier (0.4, 0, 0.2, 1)**: Standard material design easing for most transitions
- **Cubic Bezier (0.25, 1, 0.5, 1)**: More pronounced easing for carousel scrolling
- **Ease-Out**: Quick start, slow end for most animations
- **Ease-In-Out**: Balanced motion for longer transitions

### Animation Durations
- **0.2s**: Quick feedback (clicks, button states)
- **0.25s**: Standard transitions (hover, thumbnails)
- **0.3s**: Medium animations (pulses, fades)
- **0.4s**: Longer transitions (slide changes)
- **0.5s**: Carousel scrolling
- **0.6s**: Ripple effect

### Performance Considerations
- **GPU-Accelerated**: Uses transform and opacity for smooth 60fps animations
- **Will-Change**: Implicit through transform/opacity usage
- **Reduced Motion**: Complete fallback for accessibility
- **Efficient Selectors**: Minimal repaints and reflows

## Customization

To modify animations, edit:
- **[assets/section-media-gallery-embla.css](assets/section-media-gallery-embla.css)** - Animation keyframes and transitions
- **[assets/media-gallery-embla.js](assets/media-gallery-embla.js)** - Animation triggers and timing

## Browser Support
All animations use standard CSS properties supported in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)
