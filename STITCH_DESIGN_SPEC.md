# SyncTrip — Google Stitch Design Specification

This document contains the complete screen-by-screen UI/UX design specifications for **SyncTrip**, the AI-powered collaborative group trip planner. 

You can use the **Stitch Prompts** and layout breakdowns below to design each screen in Google Stitch with pixel-perfect accuracy and consistent styling.

---

## 🎨 Global Design Tokens & Styling Rules

| Element | Specification | Hex / Value |
| :--- | :--- | :--- |
| **Primary Brand** | Warm Adventurous Orange | `#D97706` |
| **Primary Dark** | Hover & Active Accent | `#B45309` |
| **Primary Light** | Soft Badge & Pill Background | `#FEF3C7` |
| **Primary Pale** | Card Accent & Selected Row | `#FFF8EB` |
| **Ink (Headings)** | Deep Navy Ink | `#172033` |
| **Primary Text** | Body Text | `#273449` |
| **Secondary Text** | Descriptions & Captions | `#667085` |
| **Muted Text** | Placeholders & Subtle Labels | `#98A2B3` |
| **Border** | Subtle Outline | `#E4E7EC` |
| **Page Background** | Warm Off-White Canvas | `#FAFAF8` |
| **Surface** | Card & Dialog Background | `#FFFFFF` |
| **Cream Surface** | Highlight Cards & Quotes | `#FFFDF8` |
| **Ocean Blue** | Transport & Links | `#1677A7` (Bg: `#E8F6FB`) |
| **Nature Green** | Active Status & Positive Budget | `#2F855A` (Bg: `#EAF5EE`) |
| **Coral Red** | Food, Expenses & Negative Balances | `#E05A47` (Bg: `#FDF1EE`) |
| **Border Radius** | Cards: `16px` / `24px` \| Inputs & Buttons: `10px` / `12px` \| Pills: `9999px` |
| **Typography** | Inter or Geist Sans. Headings: SemiBold / ExtraBold. Body: Medium / Regular. |

---

## Screen 1: Modern Landing Page
- **Route:** `/`
- **Purpose:** Introduce the product vision — *"One trip becomes one shared workspace for the entire group."* Convert visitors into signups.

### 📐 Google Stitch Prompt
```text
Modern travel SaaS landing page for "SyncTrip", an AI-powered collaborative group trip planner. 
Warm, adventurous, and premium aesthetic. Palette: warm orange (#D97706), cream (#FFFDF8), deep ink navy (#172033), ocean blue (#1677A7).
Top navigation with logo mark (compass icon inside orange square), "Sign In" ghost button, and "Start Free" orange button.
Hero section with soft orange/blue glow backdrop: pill badge "Powered by Google Gemini 2.5 AI", huge bold heading "One Trip Becomes One Shared Workspace", subtitle about ditching messy group chats for collaborative itineraries, instant expense splitting, and AI daily plans.
Two CTA buttons: "Create Your Trip Workspace" (solid orange) and "Explore 1-Click Demo" (white card outline).
4 feature cards in a grid: Live Day-by-Day (layers icon), Fair Expense Split (dollar icon), Gemini AI Planner (sparkles icon), Route Visualizer (map pin icon).
Below the hero: an interactive mock preview card showing a live trip workspace for "Kyoto Cherry Blossom Expedition" with itinerary preview, expense breakdown, and automated debt settlement banner ("Sarah Chen owes Alex Rivera $165.00").
Clean, elegant footer with copyright and links.
```

### 🧱 Layout Elements:
1. **Header (Height: 72px):** Logo with compass icon + "SyncTrip", nav links, and CTA buttons.
2. **Hero Banner:** Centered typography, badge chip with sparkle icon, primary CTA + secondary demo CTA.
3. **Pill Feature Grid (4 columns):** Soft white cards with 16px radius, icon with pale background, bold title, short subtitle.
4. **Product Preview Card:** Browser frame mock with window dots, active trip banner, 3-column live metric snippets.
5. **Footer:** Single row with logo, copyright, and heart icon.

---

## Screen 2: Sign In / Login Screen
- **Route:** `/login`
- **Purpose:** Returning users authenticate via email/password or test the application with a single click.

### 📐 Google Stitch Prompt
```text
Clean, modern authentication card for "SyncTrip" travel web app on a warm off-white background (#FAFAF8).
Centered card (420px max-width) with rounded corners (20px) and soft shadow.
Top of card: SyncTrip logo with orange compass icon, heading "Welcome back", description "Sign in to access your shared group itineraries".
Form fields:
1. "Email address" input with placeholder "you@example.com".
2. "Password" input with "Forgot password?" right-aligned text link.
Primary action button: full-width warm orange button "Sign in" with arrow icon.
Divider with text: "OR INSTANT DEMO".
Secondary action button: outlined card button with sparkle icon "Instant 1-Click Demo Login" with warm orange hover state.
Bottom card footer: "Don't have an account? Create an account" link.
```

### 🧱 Layout Elements:
- Centered vertical container on `#FAFAF8`.
- Elevated card with subtle `#E4E7EC` border and `#FFFFFF` background.
- Error banner state: light red background (`#FDF1EE`), red icon, inline error message.

---

## Screen 3: Sign Up / Register Screen
- **Route:** `/signup`
- **Purpose:** New users create their account and personal workspace.

### 📐 Google Stitch Prompt
```text
Modern user registration card for travel app "SyncTrip" on warm background (#FAFAF8).
Card centered with 20px border radius, white surface, subtle border.
Header: SyncTrip logo with orange compass, bold title "Create your account", subtitle "Start organizing group trips with AI and live sync".
Form fields:
1. Full Name input ("Alex Rivera")
2. Email address input ("alex@example.com")
3. Password input ("At least 6 characters")
4. Confirm Password input ("Repeat password")
Full-width primary button: warm orange "Create Account" with arrow icon.
Divider "OR INSTANT DEMO" and 1-Click Demo Login button.
Trust badge at bottom: green checkmark icon + "No credit card required. Free group workspace."
Footer link to Login screen.
```

---

## Screen 4: Password Reset Screen
- **Route:** `/reset-password`
- **Purpose:** User enters email to recover their password.

### 📐 Google Stitch Prompt
```text
Minimalist, polished password recovery screen for "SyncTrip".
Centered card with SyncTrip logo, title "Reset Password", subtitle "Enter your email to receive instructions to reset your password".
Form state: Email input field + full-width orange "Send Reset Link" button.
Success state (when sent): Soft green box (#EAF5EE) with large green checkmark, heading "Check your email", and confirmation message with the user's email highlighted.
Bottom footer: "Back to Sign in" link with left arrow.
```

---

## Screen 5: User Trips Dashboard
- **Route:** `/dashboard`
- **Purpose:** Overview of all user trips (upcoming and past) with instant search, filter tabs, and action to launch a new trip.

### 📐 Google Stitch Prompt
```text
Modern web application dashboard for "SyncTrip".
Sticky top navbar: logo on left, right side shows circular avatar with user profile name ("Alex Rivera"), email, and logout icon button.
Page Header: Bold heading "Your Trips" with a counter badge pill ("3"), description "Collaborative itineraries, shared budgets, and group planning in one workspace", and a primary orange button on the right "+ Create New Trip".
Search and Filter Bar:
- Left: search input with magnifying glass icon "Search by trip name or destination...".
- Right: segmented tab buttons "All Trips" (active), "Upcoming", "Past".
Trip Cards Grid (3 columns on desktop, 1 on mobile):
Each Trip Card:
- 180px height cover photo with subtle dark gradient overlay.
- Top-left badges: "Planning" (warm orange pill) or "Active Trip" (nature green pill) + "AI Generated" badge with star icon.
- Bottom overlay on photo: Trip title ("Kyoto Cherry Blossom Expedition") and location ("Kyoto, Japan" with pin icon).
- Card body: Calendar date range ("Apr 5 – Apr 12, 2026"), group budget ("$4,200 budget").
- Card footer: overlapping member avatars cluster with "+2" badge, and "Open Trip →" link in primary orange.
Empty state layout: centered compass icon in cream circle, title "No trips yet", subtitle, and "Plan a Trip" button.
Bottom AI Promo Card: gradient banner with sparkle icon, heading "Want Gemini to build a custom itinerary in 10 seconds?", and "Try AI Trip Builder" button.
```

---

## Screen 6: 4-Step Trip Creation Wizard
- **Route:** `/trip/new`
- **Purpose:** Step-by-step wizard creating a new collaborative trip workspace.

### 📐 Google Stitch Prompt
```text
Clean 4-step wizard for creating a group trip on "SyncTrip".
Top bar with logo and "Cancel" link.
Wizard progress bar at top: "Step 1 of 4: Destination & Vibe" with orange progress line.

Step 1 (Destination & Vibe):
- Heading "Where are you heading?", description.
- Autocomplete destination input with map pin icon ("e.g. Kyoto, Japan").
- "Trending Destinations" 3x2 grid of photo cards (Kyoto, Amalfi Coast, Barcelona, Banff, Bali, Reykjavik) with checkmark on active choice.
- Next button: "Next: Dates →".

Step 2 (Dates & Title):
- "Trip Name" input ("Kyoto Cherry Blossom Tour").
- Two side-by-side date inputs: "Departure Date" and "Return Date" with calendar icons.
- Back and Next buttons.

Step 3 (Budget & Crew):
- "Total Target Budget" number input + currency dropdown ("USD ($)", "EUR (€)", etc.).
- "Invite Friends" email input with "Add" button.
- Added email pills with "x" remove buttons.
- Back and Next buttons.

Step 4 (AI & Final Review):
- Large toggle card for "Generate Itinerary with Google Gemini AI" with sparkles icon and "Recommended" badge.
- When toggled active: Travel Vibe selector buttons (Balanced, Adventure, Culinary, Culture).
- "Workspace Summary" card with 4 columns: Destination, Dates, Group Budget, Crew count.
- Action button: Large orange button "Create Trip Workspace" with checkmark icon.
```

---

## Screen 7: Shared Trip Workspace — Overview Tab
- **Route:** `/trip/[tripId]?tab=overview`
- **Purpose:** Main hub for a specific trip, displaying key metrics, countdown, vibe notes, and recent stops.

### 📐 Google Stitch Prompt
```text
Collaborative group trip workspace dashboard for "SyncTrip" (Destination: Kyoto, Japan).
Sticky top navigation: Back to dashboard arrow, trip title, status badge ("planning"), and two top buttons: "Invite Friends" (outline) and "AI Planner" (solid orange with sparkles).
Hero Banner (240px height):
- High-res destination cover photo with dark gradient overlay.
- Large bold title: "Kyoto Cherry Blossom Expedition".
- Subtitle pills: Destination pin, date range "Apr 5 – Apr 12, 2026", "4 travelers", "$4,200 USD budget".
- Right side: overlapping avatar circles of the 4 travelers.
6 Workspace Navigation Tabs:
- "Overview" (active, orange underline)
- "Itinerary" (badge "5")
- "Interactive Map"
- "Budget & Split" (badge "4")
- "Travel Crew" (badge "4")
- "Settings"

Overview Content:
- 4 summary metric cards: Total Target Budget ($4,200), Planned Activities (5 Stops across 3 days), Travel Crew (4 Friends, 3 editors), Workspace Status (Live real-time collaboration).
- "Trip Vibe & Vision" cream-colored card with notes about the trip.
- "Upcoming Daily Itinerary" grid showing top 4 upcoming stops with category badges, day numbers, and times.
```

---

## Screen 8: Shared Trip Workspace — Itinerary Tab
- **Route:** `/trip/[tripId]?tab=itinerary`
- **Purpose:** Day-by-day collaborative schedule with real-time voting, costs, and categories.

### 📐 Google Stitch Prompt
```text
Collaborative daily travel itinerary builder for "SyncTrip".
Header with title "Shared Day-by-Day Schedule", description, and two action buttons: "AI Regenerate" (sparkles) and "+ Add Activity" (orange).
Day Section 1:
- Pill header: "DAY 1" (dark navy badge) with date "2026-04-05" and horizontal divider line.
- Activity Card 1: Category icon (camera for sightseeing, orange bg), time "09:30 AM", title "Fushimi Inari-taisha Torii Path", location pin "Fushimi Inari Shrine, Kyoto", estimated cost badge "$0", voting button with thumbs-up icon and count "3" (active orange state), and trash icon.
- Activity Card 2: Food category icon (coral red utensils), time "13:00 PM", title "Nishiki Market Street Food Safari", cost "$35", voting pill "2", notes quote box: "Group budget covers snacks for everyone".
Day Section 2:
- "DAY 2" with date "2026-04-06".
- Activity Card 3: "Arashiyama Bamboo Grove", sightseeing, $15.
- Activity Card 4: "Traditional Kaiseki Dinner in Gion", food, $95, notes: "Smart casual dress code".

Modal: "Add Itinerary Activity":
- Modal dialog with inputs: Day Number, Time, Activity Name, Location / Landmark, Category dropdown, Estimated Cost, and Notes.
- Cancel and "Save Activity" buttons.
```

---

## Screen 9: Shared Trip Workspace — Interactive Map Tab
- **Route:** `/trip/[tripId]?tab=map`
- **Purpose:** Geographical map visualization of the trip route and itinerary stops.

### 📐 Google Stitch Prompt
```text
Interactive travel map and route visualizer UI for "SyncTrip".
Top bar with layers icon, "Route & Place Visualizer", location count badge ("5 locations"), and day filter buttons: "All Days" (active), "Day 1", "Day 2", "Day 3".
Two-column layout (1/3 left sidebar, 2/3 right map):
Left Sidebar (Stops on Route):
- Scrollable list of numbered itinerary stops (1, 2, 3, 4, 5).
- Each stop item has: circular step number with orange background, activity title, category icon, time, location text, and estimated cost.
- Active selected item has an orange border and soft orange background (#FFF8EB).
Right Area (Map Canvas):
- Embedded interactive map of Kyoto, Japan with road networks and landmarks.
- Active Stop Overlay Card in bottom-left corner of map: Activity category badge, title "Fushimi Inari-taisha", location pin, description, cost, and a button "Google Maps ↗" to open navigation.
```

---

## Screen 10: Shared Trip Workspace — Budget & Expense Splitter Tab
- **Route:** `/trip/[tripId]?tab=budget`
- **Purpose:** Full financial hub tracking shared expenses, category spending, member balances, and automated debt settlements.

### 📐 Google Stitch Prompt
```text
Group travel budget and automated expense splitting dashboard for "SyncTrip".
Header with title "Group Budget & Expense Splitter" and "+ Add Shared Expense" orange button.
Top 3 Financial Metric Cards:
1. "Total Spent": Huge text "$3,070" with an orange progress bar showing "73% of $4,200 target budget".
2. "Remaining Budget": Huge nature green text "$1,130" with subtitle "Available for upcoming activities".
3. "Category Breakdown": 2x2 grid showing Lodging ($1,850), Transport ($680), Food & Drinks ($380), Activities ($160).

Section 2: "Who Owes Who (Settlements)":
- Cards showing exact debt transfers calculated automatically:
  - Card 1: "Sarah Chen" (red) → "Alex Rivera" (green), amount "$165.00".
  - Card 2: "Elena Rostova" (red) → "Alex Rivera" (green), amount "$385.00".

Section 3: "Member Balances":
- 4 cards for the 4 travelers: Member name, Total Paid, Total Share, and Net Balance in bold green (+$550.00) or bold red (-$165.00).

Section 4: "Expense Log":
- List of logged expenses: "Ryokan Villa Booking" ($1,850, paid by Alex Rivera), "Bullet Train Passes" ($680, paid by Kenji Sato), etc., each with trash icon.

Modal: "Add Group Expense":
- Inputs: Expense Title, Amount, Category dropdown, Date, split method.
```

---

## Screen 11: Shared Trip Workspace — Travel Crew / Members Tab
- **Route:** `/trip/[tripId]?tab=members`
- **Purpose:** View group members, assign permissions, and invite friends.

### 📐 Google Stitch Prompt
```text
Travel crew management screen for "SyncTrip".
Header with "Travel Crew (4)" and button "Invite New Member" with share icon.
Grid of member cards:
- Card 1: Large avatar for "Alex Rivera", email, and dark orange pill badge "OWNER".
- Card 2: Avatar for "Sarah Chen", email, and gray pill badge "EDITOR".
- Card 3: Avatar for "Kenji Sato", email, badge "EDITOR".
- Card 4: Avatar for "Elena Rostova", email, badge "VIEWER".

Modal: "Invite to Workspace":
- Input for friend's email address.
- Access Role dropdown: "Editor (Can add & edit itineraries/expenses)" or "Viewer (Read-only view)".
- Button: "Create Shareable Link".
- Generated Link State: Success green banner with checkmark, read-only URL input box, and "Copy Link" button.
```

---

## Screen 12: Shared Trip Workspace — Settings Tab
- **Route:** `/trip/[tripId]?tab=settings`
- **Purpose:** Workspace configuration, trip updates, and danger zone actions.

### 📐 Google Stitch Prompt
```text
Trip workspace settings screen for "SyncTrip".
Max-width 640px form layout.
Card 1 (General Settings):
- Trip Title text input with current value "Kyoto Cherry Blossom Expedition".
- Target Budget number input with currency tag ("4200 USD").
Card 2 (Danger Zone - light red border and background):
- Title "Danger Zone" in red.
- Row 1: "Leave Trip" with description and "Leave Trip" outline red button.
- Row 2 (Owner only): "Delete Entire Trip" with warning description and solid red "Delete Trip" button.
```

---

## Screen 13: Friend Invitation Landing Screen
- **Route:** `/invite/[inviteId]`
- **Purpose:** Recipient opens an invite link sent by a friend to join the workspace.

### 📐 Google Stitch Prompt
```text
Travel trip invitation landing screen for "SyncTrip".
Clean centered card (460px width) on warm background.
Card header: Colorful gradient accent bar at top, large circular avatar of inviter, heading "Alex Rivera invited you!", subtitle "Join the collaborative workspace for this upcoming group trip".
Card body:
- Cream highlighted preview box: "Trip Invitation" label, "EDITOR Access" badge, bold trip name "Kyoto Cherry Blossom Expedition", destination "Kyoto, Japan" with pin icon.
- Checklist card: "What you can do in this workspace":
  ✓ Add and vote on daily itinerary activities
  ✓ Track and split group expenses
  ✓ View interactive routes and destination maps
  ✓ Collaborate in real time with all travelers
Card footer:
- Primary full-width orange button "Accept & Join Workspace" with checkmark and right arrow.
- Ghost button "Decline Invitation".
```

---

## Screen 14: Gemini AI Trip Planner Modal
- **Triggered via:** "AI Planner" button in Workspace
- **Purpose:** Interactive dialog to generate day-by-day itineraries using Gemini AI.

### 📐 Google Stitch Prompt
```text
AI Itinerary Generator modal dialog for "SyncTrip".
Header with sparkle icon, title "Google Gemini AI Trip Planner", and close "X" button.
Initial State:
- Center icon with sparkle in pale orange circle.
- Title: "Generate Day-by-Day Itinerary for Kyoto, Japan".
- Subtitle explaining that Gemini will optimize activities, meals, and estimated expenses.
- Primary button: "Generate AI Itinerary Now" with sparkles icon.

Loading State:
- Spinning loader with text "Gemini is researching Kyoto, Japan... Optimizing routes, activities, and group budget allocations."

Preview State:
- Top bar: "Generated Preview (9 Stops)" with "Regenerate" text button.
- Scrollable list of generated activity cards: Day number, time, title ("Explore Historic Kyoto Landmarks"), estimated cost, and description.
- Action footer: Two buttons — "Append to Existing" (secondary outline) and "Replace Itinerary" (solid primary orange).
```

---

## 🚀 Quick Summary Checklist for Designers

1. **Brand Identity:** Warm Orange (`#D97706`) paired with Deep Navy Ink (`#172033`) on an off-white canvas (`#FAFAF8`).
2. **Typography Scale:** Clean modern sans-serif with bold headlines (`font-bold` / `font-extrabold`) and clear hierarchy.
3. **Card Consistency:** All cards use `16px` to `24px` rounded corners, `#FFFFFF` background, `#E4E7EC` borders, and subtle drop shadows.
4. **Interactive Accents:** Pill badges for status, category color coding, and clean avatar stacks.
