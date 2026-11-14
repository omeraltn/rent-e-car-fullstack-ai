---
name: Modern Automotive Rental
colors:
  surface: '#f9f9ff'
  surface-dim: '#ccdaf8'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d5e3ff'
  on-surface: '#0d1c31'
  on-surface-variant: '#434654'
  inverse-surface: '#233147'
  inverse-on-surface: '#ecf1ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#1d52d8'
  primary: '#0848d0'
  on-primary: '#ffffff'
  primary-container: '#3563e9'
  on-primary-container: '#f0f1ff'
  inverse-primary: '#b6c4ff'
  secondary: '#234dda'
  on-secondary: '#ffffff'
  secondary-container: '#4468f4'
  on-secondary-container: '#fffbff'
  tertiary: '#005a90'
  on-tertiary: '#ffffff'
  tertiary-container: '#0073b6'
  on-tertiary-container: '#ebf3ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164f'
  on-primary-fixed-variant: '#003ab1'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c4ff'
  on-secondary-fixed: '#001355'
  on-secondary-fixed-variant: '#0036bc'
  tertiary-fixed: '#cfe5ff'
  tertiary-fixed-dim: '#99cbff'
  on-tertiary-fixed: '#001d33'
  on-tertiary-fixed-variant: '#004a78'
  background: '#f9f9ff'
  on-background: '#0d1c31'
  surface-variant: '#d5e3ff'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a high-trust, conversion-optimized digital retail and booking experience for modern car rental. It combines the utilitarian clarity of top-tier SaaS interfaces with the aspirational, polished finish of premium automotive marketplaces. 

The aesthetic is anchored in contemporary corporate precision with subtle tactile and glass accents: crisp white surfaces, slate foundational neutral layers, and a rich, electric royal blue brand driver. The experience must feel dependable, frictionless, and transparent, giving users total confidence in vehicle pricing, specs, and reservations while maintaining an energetic visual tempo.

## Colors

The palette is engineered for high conversion, high contrast, and accessibility across daytime automotive search scenarios.

- **Primary (`#3563E9`)**: The primary brand driver, utilized for key primary actions, selection states, active tab indicators, and featured badges.
- **Secondary (`#254EDB`)**: A deep electric royal blue reserved for interactive hover states, active press feedback, and high-emphasis focus indicators.
- **Tertiary (`#54ACF7`)**: An energetic sky accent applied sparingly for highlights, secondary status tags, live vehicle telemetry indicators, and visual accents within vehicle card imagery.
- **Neutrals**:
  - `#1A202C`: Primary text, titles, vehicle model names, and prominent pricing totals.
  - `#596780`: Secondary body copy, vehicle specification labels (transmission, seating, fuel), and breadcrumb paths.
  - `#90A3BF`: Placeholder text, inactive icons, subtle borders, and secondary metadata.
  - `#EDF0F5`: Structural divider lines, disabled surfaces, and input stroke defaults.
  - `#F6F7F9`: Main page canvas background, secondary panel fills, and filter panel surfaces.
  - `#FFFFFF`: Elevated card surfaces, floating modals, dropdown menus, and hero billing sheets.

## Typography

The typography pairings leverage **Plus Jakarta Sans** for prominent displays, vehicle headings, numbers, and transactional labels, imparting a modern, slightly rounded automotive character without sacrificing geometry. **Inter** handles all dense specifications, descriptions, review blocks, and table data to preserve effortless legibility at compact sizes.

Heading levels prioritize concise scanning with tighter negative letter-spacing for vehicle names, daily pricing integers, and pickup/drop-off headers. Labels and meta-tags use uppercase or medium track adjustments to ensure clear visual grouping across dense catalog cards.

## Layout & Spacing

The layout is built upon a standard 12-column responsive fluid grid designed to display large card grids, filter sidebars, and booking summary dashboards without horizontal fatigue.

- **Desktop (1200px+)**: 12-column layout with `3rem` canvas margins and `1.5rem` to `2rem` column gutters. Sidebar filters occupy 3 columns (fixed or min-width 280px), while the vehicle catalog spans the remaining 9 columns in a 3-column subgrid.
- **Tablet (768px - 1199px)**: 8-column layout with `1.5rem` gutters and outer margins. Filter sidebars collapse into a top horizontal bar or drawer sheet; the catalog renders in a 2-column format.
- **Mobile (< 768px)**: 4-column layout with `1rem` margins and `1rem` gutters. Cards render as single-column stacks with edge-to-edge carousels for promotional and category chips.

Component spacing follows strict 4px/8px modular rhythms: `space-sm` for internal component micro-margins (e.g., icons next to label texts), `space-md` for standard form cell paddings, and `space-lg` to `space-xl` for content separation inside cards and modular sheets.

## Elevation & Depth

Visual hierarchy uses a crisp, light-bathed surface stack to communicate elevation, avoiding muddy shadows in favor of tinted, diffused blue-neutral ambient casts.

- **Canvas Level (Elevation 0)**: `#F6F7F9` background foundation for global scrolling containers.
- **Card Surfaces (Elevation 1)**: Pure `#FFFFFF` surfaces paired with an ultra-light outline (`1px solid #EDF0F5`) and ambient shadow: `0 4px 16px -4px rgba(26, 32, 44, 0.04)`.
- **Raised & Hovered Components (Elevation 2)**: Hover states on vehicle cards, dropdowns, and date pickers use: `0 12px 28px -6px rgba(53, 99, 233, 0.08), 0 4px 12px -2px rgba(26, 32, 44, 0.03)`.
- **Floating Modals & Checkout Summaries (Elevation 3)**: Sticky reservation drawers and modal overlays use `0 24px 48px -12px rgba(26, 32, 44, 0.12)`.
- **Glassmorphism Panels**: Header bars and floating sticky booking triggers employ semi-transparent backings (`background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px)`) with a crisp boundary line (`border-bottom: 1px solid rgba(237, 240, 245, 0.8)`).

## Shapes

The design system adopts a balanced roundedness (Level 2). Standard container units utilize `0.5rem` (8px), card containers scale to `1rem` (16px, `rounded-lg`), and primary modal shells or featured promo units scale up to `1.5rem` (24px, `rounded-xl`).

Interactive touch targets like primary buttons, pills, and filter chips contrast with these box containers by leveraging full-radius pill styling (`rounded-full`) or soft-corner button radii (10px to 12px) to communicate clean, click-friendly affordances.

## Components

### Buttons
- **Primary**: Solid `#3563E9` background, white label, 10px corner radius. Padding: 12px 20px (`space-sm` + `space-md`). Hover shifts smoothly to `#254EDB` with a subtle elevation boost.
- **Secondary / Soft**: Light blue tint (`#F0F4FE`) with `#3563E9` text. Hover shifts to `#E2EBFE`.
- **Outline**: 1px `#EDF0F5` border, `#596780` text. Hover border shifts to `#90A3BF` with `#1A202C` text.
- **Heart / Favorite Button**: Circular 40px icon button, white background, soft shadow, housing an outline heart (`#90A3BF`) that switches to a vibrant fill (`#ED3F3F`) when active.

### Vehicle Rental Cards
The core conversion driver of the system:
- **Header**: Top line contains vehicle name (`Plus Jakarta Sans`, 16px, bold, `#1A202C`) and category subtitle (`Inter`, 12px, `#90A3BF`), alongside the Favorite heart icon.
- **Vehicle Stage**: Center container presenting a high-res vehicle render angled 3/4 front, sitting over a subtle radial floor gradient to establish physical contact.
- **Specification Row**: Horizontal group featuring 3 micro-badges with icons: Fuel Capacity, Steering/Transmission, and Passenger Count (`Inter`, 14px, `#90A3BF`).
- **Footer**: Left-aligned price block displaying current daily price in large bold numerals (`#1A202C`, 18px), slash, and text `day` (`#90A3BF`, 12px), stacked above any strike-through original rate. Right-aligned "Rent Now" primary button.

### Filter & Selection Chips
- Default state: `#FFFFFF` background, 1px border in `#EDF0F5`, `#596780` text, rounded-full geometry.
- Active state: `#3563E9` fill, white text, and light `#3563E9` shadow glow.

### Pick-up & Drop-off Booking Blocks
- Compact card modules with dual-tone icon pills (blue for Pick-up, light blue for Drop-off).
- Embedded drop-downs for Location, Date, and Time arranged in an inline 3-column row, divider borders in `#EDF0F5`.
- A floating reverse-direction swap button (`#3563E9`, circular 48px, white directional arrows) positioned symmetrically between pick-up and drop-off segments.

### Inputs & Form Fields
- Height 48px, background `#F6F7F9` or pure `#FFFFFF`, border `1px solid #EDF0F5`, corner radius 10px.
- Focus state: border color `#3563E9` with a subtle 3px focus ring (`rgba(53, 99, 233, 0.15)`).
- Input labels rendered in `Plus Jakarta Sans`, 14px, semi-bold `#1A202C`.

### Checkboxes & Radio Elements
- Checkboxes: 20px rounded square (6px radius), border `#90A3BF`. Checked state fills with `#3563E9` with a crisp white check vector.
- Radios: 20px circular outline with an inner 8px concentric circle on active state, tinted with brand royal blue.