# SyncTrip Design System

## COLOUR SYSTEM

Primary Brand:
- Primary: #D97706
- Primary Dark: #B45309
- Primary Light: #FEF3C7
- Primary Pale: #FFF8EB

Neutrals:
- Ink / Main Heading: #172033
- Primary Text: #273449
- Secondary Text: #667085
- Muted Text: #98A2B3
- Border: #E4E7EC
- Strong Border: #CBD0D8
- Surface: #FFFFFF
- Page Background: #FAFAF8
- Cream Surface: #FFFDF8
- Dark Surface: #172033

Travel Supporting Colours:
- Ocean: #1677A7
- Ocean Dark: #125D82
- Ocean Light: #E8F6FB
- Nature Green: #2F855A
- Nature Dark: #276749
- Nature Light: #E9F7EF
- Coral: #E76F51
- Coral Dark: #C9573D
- Coral Light: #FDEDEA

AI Colours:
- AI Primary: #6D5BD0
- AI Dark: #5747B8
- AI Background: #F2F0FF
- AI Border: #D9D3FF

Semantic Colours:
- Success: #2F855A
- Warning: #D97706
- Error: #D64545
- Info: #1677A7

## CATEGORY COLOURS

Use category colours consistently across itinerary cards, badges, icons, map markers, filters, and activity labels:

- Accommodation: #7C5CFC
- Food: #E76F51
- Activity: #D97706
- Transport: #1677A7
- Shopping: #C05BCF
- Nature: #2F855A
- Other: #667085

## DESIGN RULES

1. Orange (#D97706) is the main SyncTrip action colour.
Use it for:
- primary CTA buttons
- active controls
- selected states
- important links
- primary icons
- progress indicators
- key trip highlights

2. Do not make the interface predominantly orange.
Keep the interface approximately:
- 70% neutral / white / cream
- 20% navy/dark text and structure
- 8% orange brand
- 2% supporting colours

3. Use #FAFAF8 as the default application background.
4. Use #FFFFFF for cards, panels, forms and elevated surfaces.
5. Use #FFFDF8 for warm editorial/travel sections and form backgrounds when appropriate.
6. Use #172033 for headings and important navigation.
7. Use #273449 for regular body text.
8. Use #667085 for secondary information and metadata.
9. Use #98A2B3 for muted text and placeholders.
10. Do not use pure black (#000000) for normal UI text.

## BUTTON SYSTEM

Primary Button:
- Background: #D97706
- Text: #FFFFFF
- Hover: #B45309
- Active: #92400E
- Disabled background: #E8DCCB
- Disabled text: #A79B8B

Secondary Button:
- Background: #FFFFFF
- Border: #CBD0D8
- Text: #273449
- Hover background: #F8F9FA

Dark Button:
- Background: #172033
- Text: #FFFFFF
- Hover: #25324A

## FORM SYSTEM

Default Input:
- Background: #FFFDF8 or #FFFFFF
- Border: #E4E7EC
- Text: #273449
- Placeholder: #98A2B3

Focused Input:
- Border: #D97706
- Focus ring should use a subtle orange transparent glow equivalent to rgba(217,119,6,0.15)

Error Input:
- Border: #D64545
- Background: #FFF8F8

Success Input:
- Border: #2F855A
- Background: #F5FBF7

## SEMANTIC COMPONENTS

Success:
- Main: #2F855A
- Background: #E9F7EF
- Border: #B7E1C7

Warning:
- Main: #D97706
- Background: #FFF4DB
- Border: #F5D49A

Error:
- Main: #D64545
- Background: #FDECEC
- Border: #F2B8B8

Info:
- Main: #1677A7
- Background: #E8F6FB
- Border: #B9DFED

## AI UI

The AI Planner must have a visually distinct but compatible identity.
Use:
- AI Primary: #6D5BD0
- AI Dark: #5747B8
- AI Background: #F2F0FF
- AI Border: #D9D3FF

Use this system for:
- AI Trip Planner card
- AI buttons
- AI loading state
- AI-generated itinerary labels
- regenerate controls
- AI information panels

Do not use the AI purple as the main SyncTrip brand colour.

## BUDGET UI

Use semantic budget colours:
- Healthy spending: #2F855A
- Approaching budget limit: #D97706
- Over budget: #D64545

For budget progress:
- under approximately 70%: green
- approaching the limit: orange
- over budget: red
Do not rely on colour alone; also show text/status labels.

## MAP UI

Use these marker colours:
- Destination: #D97706
- Accommodation: #7C5CFC
- Food: #E76F51
- Activity: #1677A7
- Nature: #2F855A
- Selected location: #172033

## ITINERARY UI

Use the same category colour mapping across:
- category badge
- category icon
- timeline indicator
- map marker
- activity accent
This must make the itinerary and map visually feel like one connected system.

## LANDING PAGE

Use:
- white / cream background
- navy headings
- orange CTA
- subtle travel-colour accents
- large travel imagery
- restrained use of gradients

Do not create a rainbow-like landing page.

## DASHBOARD

Use mostly:
- #FAFAF8 background
- #FFFFFF cards
- #172033 headings
- #667085 secondary text
- #D97706 for major actions

The dashboard should feel calm and organized.

## TRIP OVERVIEW

Use orange for:
- active trip
- primary CTA
- key trip information

Use green:
- healthy budget
- completed items

Use blue:
- locations/routes

Use purple:
- AI functionality

## ITINERARY

Keep the base card neutral and use category colours as small accents rather than filling entire cards with strong colours.

## MAP

Keep the map dominant. Overlay UI should remain mostly white/cream with orange selection states and category-specific markers.

## BUDGET

Keep the budget section visually clear and data-focused. Avoid excessive colour. Use colour primarily to communicate status.

## MEMBERS

Keep member cards neutral. Use:
- orange for owner
- green for active/accepted
- muted gray for pending
- red only for destructive/error state

## NAVIGATION

Active navigation:
- text: #D97706
- optional very light background: #FFF8EB

Inactive navigation:
- text: #667085

Primary navigation heading/logo:
- #172033

## HOVER / ACTIVE STATES

Every interactive component should have:
- default
- hover
- active
- disabled
- focus-visible
Use the existing palette rather than creating arbitrary colours.

## ACCESSIBILITY

Maintain accessible text/background contrast.
Do not communicate important information through colour alone.
Use:
- icons
- text labels
- badges
- status indicators

## DESIGN TOKENS

Do not hardcode colours throughout the application.
Create semantic design tokens / CSS variables such as:
--color-primary
--color-primary-dark
--color-primary-light
--color-primary-pale
--color-ink
--color-text
--color-text-secondary
--color-text-muted
--color-background
--color-surface
--color-cream
--color-border
--color-border-strong
--color-ocean
--color-ocean-light
--color-green
--color-green-light
--color-coral
--color-coral-light
--color-ai
--color-ai-background
--color-ai-border
--color-success
--color-warning
--color-error
--color-info

If Tailwind/shadcn is being used, map the system into the theme configuration and semantic utility classes.
