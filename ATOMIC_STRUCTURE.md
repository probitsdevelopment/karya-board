# Karya Board - Atomic Design Structure

## Overview
The application now follows strict **Atomic Design** principles with a clear component hierarchy:

```
src/
├── components/
│   ├── atoms/           # Smallest, reusable UI elements
│   ├── molecules/       # Simple combinations of atoms
│   ├── organisms/       # Complex, feature-rich components
│   └── templates/       # Page-level layouts
├── features/            # Redux slices for state management
├── hooks.ts            # Custom Redux hooks
└── store.ts            # Redux store configuration
```

---

## Atomic Design Hierarchy

### 🔹 **Atoms** (Smallest Building Blocks)
Basic UI elements that can't be broken down further.

#### 1. **Badge** (`atoms/Badge/`)
- **Purpose**: Display colored count badges
- **Props**: `children`, `color` (blue | orange | purple | gray)
- **Usage**: Column task counts, status indicators

#### 2. **Avatar** (`atoms/Avatar/`)
- **Purpose**: Display user initials in a circle
- **Props**: `name`, `color`
- **Usage**: Task assignees, user profiles

#### 3. **IconButton** (`atoms/IconButton/`)
- **Purpose**: Reusable button with Lucide icon
- **Props**: `icon` (LucideIcon), `onClick`, `active`
- **Usage**: Filter, download, action buttons

---

### 🔸 **Molecules** (Atom Combinations)
Simple components composed of 2-3 atoms with a single responsibility.

#### 1. **TaskTag** (`molecules/TaskTag/`)
- **Composed of**: Styled span element
- **Purpose**: Display task IDs with background color
- **Props**: `label`, `color`

#### 2. **TaskMeta** (`molecules/TaskMeta/`)
- **Composed of**: Icon + Text
- **Purpose**: Display task metadata (due date, comments)
- **Props**: `icon`, `text`, `color`

#### 3. **TaskCard** (`molecules/TaskCard/`)
- **Composed of**: TaskTag + Avatar + TaskMeta
- **Purpose**: Display complete task information
- **Props**: `task` object
- **Structure**:
  - Task ID tag
  - Task title
  - Due date metadata
  - Assignee avatar with date
  - Comments count

#### 4. **ColumnHeader** (`molecules/ColumnHeader/`)
- **Composed of**: Title + Badge + Menu button
- **Purpose**: Display column title with task count
- **Props**: `title`, `count`, `color`

---

### 🔶 **Organisms** (Feature-Complete Components)
Complex components that form distinct sections of the interface.

#### 1. **KanbanColumn** (`organisms/KanbanColumn/`)
- **Composed of**: ColumnHeader + Multiple TaskCards
- **Purpose**: Display a full Kanban column with scrollable tasks
- **Props**: `column` (id, title, color, tasks[])
- **Features**:
  - Scrollable task list
  - Fixed width (w-72)
  - Gray background

#### 2. **TopBar** (`organisms/TopBar/`)
- **Composed of**: Logo + Search input + User button
- **Purpose**: Application header navigation
- **Features**:
  - "KaryaBoard" branding
  - Global search functionality
  - User profile access

#### 3. **ActionBar** (`organisms/ActionBar/`)
- **Composed of**: Breadcrumb + Search + IconButtons + CTA button
- **Purpose**: Contextual actions for current view
- **Features**:
  - Contextual search ("Search trademarks...")
  - Filter and download actions
  - "Create Brand" primary action

---

### 📋 **Templates** (Page Layouts)
Complete page structures that compose organisms.

#### 1. **KanbanBoard** (`templates/KanbanBoard/`)
- **Composed of**: TopBar + ActionBar + Multiple KanbanColumns
- **Purpose**: Main Kanban board view
- **State Management**: Local useState for columns data
- **Features**:
  - Horizontal scrolling for columns
  - Responsive layout
  - Background color (bg-gray-100)

---

## Component Dependencies

```
KanbanBoard (Template)
├── TopBar (Organism)
│   ├── Search input (native)
│   └── User button (native)
├── ActionBar (Organism)
│   ├── IconButton (Atom) x3
│   └── Create button (native)
└── KanbanColumn (Organism) x4
    ├── ColumnHeader (Molecule)
    │   └── Badge (Atom)
    └── TaskCard (Molecule) xN
        ├── TaskTag (Molecule)
        ├── Avatar (Atom)
        └── TaskMeta (Molecule) x2
```

---

## State Management Architecture

### Redux Slices

#### **columnsSlice** (`features/columns/`)
- **State**: `columns[]`, `loading`, `error`
- **Async Thunks**:
  - `fetchColumns()` - GET /columns
  - `addColumn(title)` - POST /columns
  - `updateColumn({id, title?, position?})` - PATCH /columns/:id
  - `deleteColumn(id)` - DELETE /columns/:id
- **Validation**:
  - Sequential numeric ID generation
  - Duplicate position detection
  - Delete protection for IDs 1-8

#### **tasksSlice** (`features/tasks/`)
- **State**: Prepared for future task management
- **Purpose**: Will handle CRUD for tasks when integrated with backend

---

## Navigation Flow

```
App Entry
    ↓
KaryaBoard (Configuration Screen)
    ├── Column Setup
    ├── Position Editing
    ├── Validation
    └── [Create Board] Button
          ↓
    KanbanBoard (Main Board View)
        ├── TopBar
        ├── ActionBar
        └── Columns with Tasks
```

---

## Type Safety

### Key Interfaces

```typescript
// Task type
interface Task {
  id: string;
  title: string;
  dueDate: string;
  assignee: string;
  assignedDate: string;
  comments: string;
  status: 'active' | 'inactive';
}

// Column type (Redux)
interface Column {
  id: string;
  title: string;
  position: number;
}

// Kanban Column type (UI)
interface KanbanColumnData {
  id: string;
  title: string;
  color: 'blue' | 'orange' | 'purple' | 'gray';
  tasks: Task[];
}
```

---

## Styling Approach

### Configuration Screen (Custom CSS)
- **File**: `src/index.css`
- **Pattern**: BEM-like `karya-*` classes
- **Purpose**: Board configuration with gradient background

### Kanban Board (Tailwind CSS)
- **Pattern**: Utility-first classes
- **Components**: Fully styled with Tailwind v4
- **Responsive**: Mobile-first approach

---

## File Structure Tree

```
src/
├── components/
│   ├── atoms/
│   │   ├── Avatar/
│   │   │   ├── Avatar.tsx
│   │   │   └── index.ts
│   │   ├── Badge/
│   │   │   ├── Badge.tsx
│   │   │   └── index.ts
│   │   └── IconButton/
│   │       ├── IconButton.tsx
│   │       └── index.ts
│   ├── molecules/
│   │   ├── ColumnHeader/
│   │   │   ├── ColumnHeader.tsx
│   │   │   └── index.ts
│   │   ├── TaskCard/
│   │   │   ├── TaskCard.tsx
│   │   │   └── index.ts
│   │   ├── TaskMeta/
│   │   │   ├── TaskMeta.tsx
│   │   │   └── index.ts
│   │   └── TaskTag/
│   │       ├── TaskTag.tsx
│   │       └── index.ts
│   ├── organisms/
│   │   ├── ActionBar/
│   │   │   ├── ActionBar.tsx
│   │   │   └── index.ts
│   │   ├── KanbanColumn/
│   │   │   ├── KanbanColumn.tsx
│   │   │   └── index.ts
│   │   └── TopBar/
│   │       ├── TopBar.tsx
│   │       └── index.ts
│   └── templates/
│       └── KanbanBoard/
│           ├── KanbanBoard.tsx
│           └── index.ts
├── features/
│   ├── columns/
│   │   ├── columnsSlice.ts
│   │   └── index.ts
│   └── tasks/
│       ├── tasksSlice.ts
│       └── index.ts
├── App.tsx (Main app with routing logic)
├── store.ts
└── hooks.ts
```

---

## Benefits of This Structure

### ✅ **Reusability**
- Atoms and molecules can be used anywhere
- No duplicate code for common UI patterns

### ✅ **Maintainability**
- Clear separation of concerns
- Easy to locate and update components

### ✅ **Testability**
- Each component has a single responsibility
- Easy to write unit tests for isolated components

### ✅ **Scalability**
- New features can reuse existing atoms/molecules
- Consistent design system across the app

### ✅ **Type Safety**
- Full TypeScript coverage
- Interfaces exported alongside components

### ✅ **Barrel Exports**
- Clean imports: `import Badge from 'components/atoms/Badge'`
- Encapsulated component structure

---

## Integration Points

### Current Integration
1. **Board Configuration** → **Kanban Board**
   - Button click triggers navigation
   - State managed via `showKanbanBoard` boolean

### Future Integration
2. **Column Configuration** → **Dynamic Columns**
   - Fetch configured columns from Redux store
   - Map to KanbanColumnData with tasks

3. **Tasks from API** → **Task Cards**
   - Replace hardcoded tasks with API data
   - Connect to `tasksSlice` Redux state

---

## Next Steps for Full Integration

1. **Connect Redux columns to Kanban board**
   - Fetch columns from store in KanbanBoard template
   - Map column positions to display order

2. **Implement task management**
   - Create task CRUD operations in tasksSlice
   - Add "Create Brand" functionality

3. **Add drag & drop**
   - Install `@dnd-kit/core` or `react-beautiful-dnd`
   - Implement reordering in KanbanColumn

4. **Add navigation**
   - React Router for proper routing
   - Back button from Kanban to Configuration

5. **Persist state**
   - Save board configuration to localStorage
   - Sync with JSON Server on changes

---

## Component Usage Examples

### Using Atoms
```tsx
import Badge from 'components/atoms/Badge';
import Avatar from 'components/atoms/Avatar';

<Badge color="blue">5</Badge>
<Avatar name="John Doe" color="bg-purple-500" />
```

### Using Molecules
```tsx
import TaskCard from 'components/molecules/TaskCard';

<TaskCard task={{
  id: 'REQ-45',
  title: 'Java Training',
  dueDate: 'March 21',
  assignee: 'Admin S',
  assignedDate: 'March 5, 2025',
  comments: '12',
  status: 'active'
}} />
```

### Using Organisms
```tsx
import KanbanColumn from 'components/organisms/KanbanColumn';

<KanbanColumn column={{
  id: 'todo',
  title: 'Todo',
  color: 'gray',
  tasks: [/* task objects */]
}} />
```

---

## Conclusion

The Karya Board application now follows a **strict atomic design pattern** with:
- ✅ Clear component hierarchy (Atoms → Molecules → Organisms → Templates)
- ✅ Single Responsibility Principle for each component
- ✅ Reusable, composable UI elements
- ✅ Type-safe interfaces throughout
- ✅ Barrel exports for clean imports
- ✅ Separation of configuration and board views
- ✅ Redux state management for persistence

This structure makes the codebase **scalable, maintainable, and follows industry best practices** for React applications.
