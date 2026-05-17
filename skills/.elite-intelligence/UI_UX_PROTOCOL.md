# UI-UX Pro Max Protocol - Antographic Edition

## 1. Vision & Strategy
Always start by defining the **Mental Model** and **Design Metaphor** for the task.
- Is it a "Clinic Management" system? (Clean, trustworthy, surgical precision).
- Is it a "Marketing Landing Page"? (Dynamic, vibrant, engaging).

## 2. Design System First (Atomic Level)
Never write ad-hoc styles. Build the `DESIGN_SYSTEM.md` or a root CSS file first.

### Color Palette (Premium)
- Avoid flat colors. Use HSL scales.
- Primary: #1e3a8a (Trust Blue)
- Secondary: #f59e0b (Warm Amber)
- Neutral: #111827 (Dark Gray)
- Surface: #ffffff (Light) / #1f2937 (Dark)

### Typography
- Google Fonts: Inter, Outfit, or Roboto.
- Scale: 12px (Caption), 14px (Body), 16px (Lead), 20px (H3), 24px (H2), 32px (H1).

### Layout Rules
- **Grid**: 4px/8px baseline rhythm.
- **Click Targets**: Minimum 44x44px.
- **Safe Areas**: Respect notch and home indicator.

## 3. Interactive Polish
- **Animations**: 150ms-300ms for state changes. Use `spring` logic where possible.
- **Feedback**: Immediate visual feedback on touch/click.
- **Glassmorphism**: Use for overlays and floating cards (Blur: 10-20px, Translucency: 10-20%).

## 4. Anti-Patterns (Forbidden)
- NO emojis as primary icons. (Use Phosphor, Lucide, or Iconsax).
- NO default browser scrollbars. (Customize them).
- NO unpadded text containers.
- NO simple MVPs. Aim for "Boutique Quality".
