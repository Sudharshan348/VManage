// # Frontend Component Specification: Room Allocation Dashboard

// ## 1. Context & Objective
// Build an interactive dashboard component for a Smart Hostel Management Portal. This component will be used by Admins/Wardens to visually check room availability, filter by occupancy status, and view detailed metrics for individual rooms on a floor plan grid.

// ## 2. Tech Stack Requirements
// * **Framework:** Next.js 16 (App Router)
// * **Styling:** Tailwind CSS
// * **UI Library:** shadcn/ui (use components like `Card`, `Badge`, `HoverCard` or `Tooltip`, `Select` or `Tabs` for filtering)
// * **Language:** TypeScript
// * **Icons:** Lucide React

// ## 3. Data Interfaces
// The component must consume an array of room objects matching this TypeScript interface, derived from the backend API:

// ```typescript
// type RoomType = "two" | "three" | "four" | "six";
// type RoomStatus = "available" | "full" | "maintenance";

// interface IRoom {
//   _id: string;
//   roomNumber: string;
//   block: string;
//   floor: number;
//   type: RoomType;
//   capacity: number;
//   currentOccupancy: number;
//   status: RoomStatus;
//   amenities: string[];
// }

// interface ApiResponse {
//   statusCode: number;
//   success: boolean;
//   message: string;
//   data: IRoom[];
// }
//   Gemini said
// Here is a comprehensive technical specification document. You can save this as a .md file (e.g., room-allocation-dashboard-spec.md) and provide it to any coding agent to generate the exact Next.js component you need.

// Markdown
// # Frontend Component Specification: Room Allocation Dashboard

// ## 1. Context & Objective
// Build an interactive dashboard component for a Smart Hostel Management Portal. This component will be used by Admins/Wardens to visually check room availability, filter by occupancy status, and view detailed metrics for individual rooms on a floor plan grid.

// ## 2. Tech Stack Requirements
// * **Framework:** Next.js 16 (App Router)
// * **Styling:** Tailwind CSS
// * **UI Library:** shadcn/ui (use components like `Card`, `Badge`, `HoverCard` or `Tooltip`, `Select` or `Tabs` for filtering)
// * **Language:** TypeScript
// * **Icons:** Lucide React

// ## 3. Data Interfaces
// The component must consume an array of room objects matching this TypeScript interface, derived from the backend API:

// ```typescript
// type RoomType = "two" | "three" | "four" | "six";
// type RoomStatus = "available" | "full" | "maintenance";

// interface IRoom {
//   _id: string;
//   roomNumber: string;
//   block: string;
//   floor: number;
//   type: RoomType;
//   capacity: number;
//   currentOccupancy: number;
//   status: RoomStatus;
//   amenities: string[];
// }

// interface ApiResponse {
//   statusCode: number;
//   success: boolean;
//   message: string;
//   data: IRoom[];
// }
// 4. API Integration Strategy
// The component should be a Server Component (if purely viewing) or a Client Component (if handling complex client-side filtering state). A hybrid approach is preferred: a Server Component that fetches data and passes it to an interactive Client Component.

// Endpoint: GET /api/v1/rooms

// Ensure graceful handling of loading states (e.g., skeletons) and empty states (no rooms found).

// 5. UI & Behavioral Requirements
// A. Top Layout & Controls
// Header: Title (e.g., "Live Room Inventory") and summary metrics (Total Rooms, Total Available Beds).

// Filters: Provide a control (toggle group or dropdown) to filter the grid:

// All Rooms (Default)

// Empty Only (currentOccupancy === 0)

// Partially Allotted (currentOccupancy > 0 && currentOccupancy < capacity)

// Fully Allotted (currentOccupancy === capacity)

// B. Grid Visualization
// Render the rooms in a responsive CSS Grid (grid-cols-2 md:grid-cols-4 lg:grid-cols-6).

// Group or segment the grid visually by block and floor if possible.

// C. Visual Indicators (Room Cards)
// Each room must be represented as a distinct block/card. The styling must strongly indicate its occupancy state:

// Empty (Available): Clean background, green borders or accents.

// Partially Allotted: Orange/Amber borders or subtle background tint.

// Fully Allotted: Greyed out or muted styling with red/slate accents.

// Maintenance: Diagonal stripes or stark warning styling.

// D. Interaction (Hover/Select)
// Wrap each room card in a HoverCard or Tooltip (from shadcn/ui).

// Hover Content: When hovered, display:

// Room Number

// Type (e.g., "4-Seater")

// Calculated Metric: "Beds Available: X" (where X = capacity - currentOccupancy)

// List of amenities (if any)

// 6. Edge Cases to Handle
// Over-occupancy protection: If for any reason currentOccupancy > capacity in the payload, flag it visually as a severe data error.

// Responsiveness: The grid must collapse to fewer columns on mobile devices without breaking the hover interactions (consider fallback to tap/click for touch devices).