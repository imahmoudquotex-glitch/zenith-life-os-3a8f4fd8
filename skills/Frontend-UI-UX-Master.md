# Frontend Architecture & Next.js Best Practices

## Objective
Establish a scalable, high-performance architecture for large web applications and complex dashboards using Next.js.

## Core Directives
1. **Component Modularity**: Strictly separate UI components from business logic. Keep components small, readable, and highly reusable.
2. **Dashboard Master Layouts**: Use Next.js App Router layout features effectively. Persist sidebars and headers, while keeping main content areas dynamic.
3. **State Management**: Prefer server components by default. Use Client components only when interactivity (hooks, state) is strictly required. Push state down the tree as much as possible.
4. **Data Fetching**: Utilize React Server Components (RSC) and caching (`fetch({ next: { revalidate: X } })`) for optimal performance.
5. **RTL Ready**: Ensure all architectures natively support layout shifts, logical CSS properties (`padding-inline-start`, etc.), and proper text alignment natively without hacks.

# Premium UI/UX & Framer Motion Mastery (Shadcn + Tailwind)

## Objective
Deliver "wow" factor user interfaces. Combine the speed of Shadcn/Tailwind with the fluidity of Framer Motion to create premium, interactive, and modern designs.

## Style Guidelines
1. **Shadcn Integration**: Leverage Shadcn UI patterns. Build robust, accessible primitives (Buttons, Cards, Modals) using Tailwind classes (`cn()` utility).
2. **Framer Motion Micro-Interactions**:
   - Every interactive element (buttons, cards) must have subtle hover scales (`whileHover={{ scale: 1.02 }}`).
   - Lists should animate progressively using `staggerChildren`.
   - Modals and page transitions must be smooth (opacity and y-axis shifts).
3. **Modern Aesthetics (Glassmorphism & Depth)**:
   - Avoid flat, dull colors.
   - Use soft drop shadows (`shadow-sm`, `shadow-lg`, colored glow effects).
   - Implement glassmorphism where appropriate (`backdrop-blur-md bg-white/10 dark:bg-black/20`).
4. **Typography**: Use modern, clean fonts. Establish clear hierarchy using consistent font weights and muted colors (`text-muted-foreground`) for secondary text.

# UI/UX Pro Max: Next-Level Aesthetics

## Objective
Elevate interfaces from "good" to "world-class" using advanced spacing, typography scaling, and psychological design principles.

## Next-Level Directives
1. **Micro-spacing**: Do not rely on generic padding. Use asymmetrical spacing where it enhances visual focus (e.g., more padding at the bottom of a card than the top for visual grounding).
2. **Typography Fluidity**: Ensure text scales smoothly across breakpoints, using clamping (`clamp()`) or Tailwind's responsive typography utilities.
3. **Color Theory & Depth**:
   - Never use pure `#000000` or `#FFFFFF`. Use soft off-blacks (e.g., `zinc-950`) and off-whites.
   - Create depth without shadows by utilizing subtle border colors (e.g., `border-white/10`) on dark themes to give cards definition.
4. **Empty States & Onboarding**: Never leave a dashboard or list empty with just "No data". Always design beautiful empty states with vector graphics or subtle prompts encouraging user interaction.

# Skill: Nour El Hayah (موقع الدكتور) Development
# Description: Expertise in developing and maintaining the "نور الحياة" medical platform.

## Project Context
"Nour El Hayah" is a premium medical prototype built originally with Lovable and now maintained in Antigravity. It serves as a comprehensive platform for medical services, goals, and programs.

## Technology Stack
- **Framework**: React 19
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS 4 with custom `styles.css`
- **UI Components**: Radix UI (accessible primitives)
- **Icons**: Lucide React
- **Validation**: Zod + React Hook Form

## Development Standards
- **Premium Aesthetics**: Always adhere to 'WOW' design principles. Use glassmorphism, smooth gradients, and interactive animations.
- **RTL Support**: Since the project is in Arabic, ensure all layouts and components support Right-to-Left (RTL) correctly.
- **Component Reuse**: Utilize existing components in `src/components/ui` for consistency.
- **SEO**: Maintain SEO best practices in all routes (Meta titles, descriptions, semantic HTML).

## Main Routes
- `index.tsx`: Landing page with hero and key highlights.
- `services.tsx`: Detailed medical services offered.
- `goals.tsx`: Mission and vision of the doctor/clinic.
- `programs.tsx`: Specific health or treatment programs.
- `contact.tsx`: Appointment booking and contact information.

## Workflow
1. Use `npm run dev` to start the local environment (usually on port 8080).
2. For design updates, prioritize `src/styles.css` and Tailwind classes.
3. For functional logic, use custom hooks in `src/hooks`.
4. Document all major changes in this skill file or the project README.

# Specialized Framework Best Practices (shadcn, TailAdmin, TailGrids)

## Directives
1. **shadcn/ui Authority**: ALWAYS use shadcn/ui components where applicable. NEVER install them as standard monolithic packages; integrate them directly to maintain full control.
2. **Structural Composition**: 
   - For enterprise dashboards, adopt TailAdmin proven layouts (persistent highly-styled sidebars, high-contrast metrics header cards).
   - Use TailGrids utility concepts for structured rapid layouts. Do not write custom CSS for layout; strictly use Tailwind utility classes.
3. **Accessibility**: Every element must retain Radix UI accessibility standards (aria-labels, keyboard navigation) unmodified. Provide flawless user experiences without sacrificing modern aesthetics.
