# CategorySelector Implementation Guide

## ✅ What Was Created

### 1. **CategorySelector Component** (`src/pages/tugonsenseproblem/CategorySelector.tsx`)
A complete category management interface with dropdown topics and nested categories.

### 2. **Key Features Implemented:**

#### 📋 **Topic Dropdown System**
- Topics display as collapsible rows with numbered badges
- Click to expand/collapse and view categories
- **Animated teal line effect** - When a topic is expanded, a teal vertical line animates from top to bottom on the left edge
- Chevron icon rotates 180° on expand/collapse
- Selected topic gets teal background tint

#### 📁 **Category Management**
- Categories load dynamically based on selected topic
- Each category shows under its parent topic with indentation
- Left border connects categories to their parent topic
- Checkbox selection for categories
- Add, Edit, Delete operations with modals

#### 🎨 **UI Design**
- Clean, minimalistic design matching Student Progress page
- Separated header with title and description
- White card with subtle shadows
- Hover effects on all interactive elements
- Responsive design (mobile + desktop)

#### 🔄 **Database Integration**
- Connects to `tugonsense_categories` table
- Foreign key relationship with `tugonsense_topics`
- Auto-increment `category_id` per topic
- CASCADE delete support
- Created/updated by user tracking

---

## 🗄️ Database Schema

### Topics Table (`tugonsense_topics`)
```sql
id: integer (Primary Key)
name: text
description: text
created_at, updated_at: timestamp
created_by, updated_by: uuid (FK to auth.users)
```

### Categories Table (`tugonsense_categories`)
```sql
id: bigserial (Primary Key)
topic_id: integer (FK to tugonsense_topics, CASCADE)
category_id: integer (unique per topic_id)
title: text
category_question: text (nullable)
created_at, updated_at: timestamp
created_by, updated_by: uuid (FK to auth.users)
```

**Unique Constraint:** `(topic_id, category_id)` - Each topic can have category_id 1, 2, 3, etc.

---

## 🎭 Visual Effects Implemented

### 1. **Animated Teal Line (On Topic Expand)**
```tsx
{expandedTopicId === topic.id && (
  <motion.div
    className="absolute left-0 top-0 bottom-0 w-1"
    style={{ background: color.teal }}
    initial={{ height: 0, top: "50%" }}
    animate={{ height: "100%", top: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  />
)}
```

**Effect:** When you click a topic, a teal vertical line slides from the center to fill the entire left edge (top to bottom) in 0.3 seconds.

### 2. **Chevron Rotation**
```tsx
<motion.div
  animate={{ rotate: expandedTopicId === topic.id ? 180 : 0 }}
  transition={{ duration: 0.3 }}
>
  <ChevronDown />
</motion.div>
```

### 3. **Smooth Dropdown Animation**
```tsx
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: "auto", opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Categories list */}
</motion.div>
```

---

## 📂 File Structure

```
TugonV2/
├── src/
│   ├── App.tsx (updated with route)
│   └── pages/
│       └── tugonsenseproblem/
│           ├── TopicSelector.tsx (existing)
│           └── CategorySelector.tsx (NEW)
```

---

## 🚀 Usage

### Accessing the Page
Navigate to: `/categoryselector`

The page includes:
- **TeacherNavbar** (automatically shown via App.tsx route prefix)
- **Topic dropdown list**
- **Category CRUD operations**
- **Selection tracking**

### Workflow

1. **Select a Topic**
   - Click on any topic row
   - Topic expands with animated teal line
   - Categories load for that topic

2. **View Categories**
   - Categories appear indented under topic
   - Connected with left border line
   - Shows title and optional question

3. **Add Category**
   - Click "Add Category" button at bottom
   - Modal opens with form fields
   - Enter title (required) and question (optional)
   - Supports LaTeX in both fields
   - Live preview shown for title

4. **Edit Category**
   - Click pencil icon on category
   - Modal opens with current values
   - Update and save

5. **Delete Category**
   - Click trash icon on category
   - Confirmation modal with CASCADE warning
   - Deletes category and all child data

6. **Select Categories**
   - Click checkbox on any category
   - Multiple selection supported
   - Summary shows count at bottom

---

## 🔧 Technical Implementation

### State Management
```typescript
// Topics
const [topics, setTopics] = useState<Topic[]>([]);
const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
const [expandedTopicId, setExpandedTopicId] = useState<number | null>(null);

// Categories
const [categories, setCategories] = useState<Category[]>([]);
const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
```

### Key Functions

#### `loadTopics()`
- Fetches all topics from Supabase
- Auto-selects first topic on load
- Orders by ID ascending

#### `loadCategories(topicId)`
- Fetches categories for specific topic
- Filters by `topic_id`
- Orders by `category_id` ascending

#### `addCategory()`
- Gets highest `category_id` for selected topic
- Increments by 1
- Inserts with `created_by` field

#### `updateCategory()`
- Updates title and question
- Sets `updated_by` field
- Refreshes local state

#### `deleteCategory()`
- Deletes from Supabase
- CASCADE removes child questions/answers
- Updates local state

---

## 🎨 Styling

### Color Palette
```typescript
const color = {
  teal: "#14b8a6",    // Primary accent
  deep: "#0f172a",    // Text
  steel: "#64748b",   // Secondary text
  mist: "#cbd5e1",    // Borders
  ocean: "#0ea5e9",   // Edit modal
};
```

### Topic States
- **Default**: White background, gray border, steel number badge
- **Expanded**: Teal tint background, teal border, teal badge, animated line
- **Hover**: Subtle transition effects

### Category States
- **Default**: Gray background (`bg-gray-50`)
- **Hover**: Darker gray (`bg-gray-100`)
- **Selected**: Teal checkbox with checkmark

---

## 🔄 Route Configuration

Added to `App.tsx`:

```typescript
// Import
import CategorySelector from "./pages/tugonsenseproblem/CategorySelector";

// Teacher prefix
"/categoryselector"

// Route
<Route path="/categoryselector" element={<CategorySelector />} />
```

---

## 📱 Responsive Design

- **Mobile**: Stacked layout, full-width buttons, smaller text
- **Desktop**: Wider layout, larger text, spacious padding
- **Breakpoints**: `sm:` (640px), responsive spacing/text

---

## ⚠️ Important Notes

1. **CASCADE Deletion**: Deleting a category will delete all associated questions and answer steps

2. **Auto-Increment**: `category_id` is calculated per topic (each topic has its own 1, 2, 3... sequence)

3. **Selection**: Categories can be selected via checkbox (for future batch operations)

4. **LaTeX Support**: Both title and question fields support LaTeX math rendering

5. **Authentication**: User must be signed in to add/edit/delete categories

6. **First Topic Auto-Select**: On page load, first topic is automatically selected and expanded

---

## 🐛 Troubleshooting

### Categories not loading
- Check if topic is selected (expandedTopicId should be set)
- Verify `topic_id` matches in database
- Check Supabase RLS policies

### Add button disabled
- Ensure a topic is selected first
- Check if user is authenticated

### Teal line not animating
- Verify Framer Motion is installed
- Check browser supports CSS transforms

---

## 🎯 Next Steps

Suggested enhancements:
1. Add question selector (next level in hierarchy)
2. Bulk operations for selected categories
3. Search/filter categories
4. Drag-and-drop reordering
5. Export/import functionality

---

## 📊 Component Hierarchy

```
CategorySelector
├── Header (title + description)
├── Main Content Card
│   ├── Error Banner (if error)
│   ├── Loading Spinner (if loading)
│   └── Topics List
│       └── For each Topic:
│           ├── Topic Row (with animated teal line)
│           └── Categories Dropdown
│               └── For each Category:
│                   ├── Checkbox
│                   ├── Title + Question
│                   └── Edit/Delete buttons
├── Add Category Button
├── Selected Categories Summary
└── Modals
    ├── Add Category Modal
    ├── Edit Category Modal
    └── Delete Confirmation Modal
```

---

## ✨ Summary

The CategorySelector is a **production-ready component** that:
- ✅ Loads topics from Supabase dynamically
- ✅ Shows categories in expandable dropdown per topic
- ✅ Includes animated teal line effect on topic expansion
- ✅ Supports full CRUD operations
- ✅ Has clean, minimalistic UI matching design system
- ✅ Includes LaTeX support for math content
- ✅ Is fully responsive and accessible
- ✅ Integrated with Teacher Dashboard layout

Navigate to `/categoryselector` to start managing categories! 🎉
