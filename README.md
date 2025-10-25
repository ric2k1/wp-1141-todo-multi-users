# Todo Multi-Users App

A collaborative todo application built with Next.js 14+, TypeScript, PostgreSQL, Prisma, and NextAuth. This app allows multiple users to share and manage todos together in a global workspace.

## Features

- **Global Todo Sharing**: All todos are shared among all authenticated users
- **Tag-based Organization**: Organize todos with tags and filter by them
- **Smart Tag Input**: Autocomplete suggestions from existing tags
- **Soft Delete**: Mark todos for deletion with confirmation dialog
- **Real-time Updates**: Todos refresh on user actions (no WebSocket needed)
- **Responsive Design**: Clean, modern UI with beige background
- **Authentication Ready**: Prepared for OAuth (Google, GitHub, Facebook)

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Validation**: Zod
- **Auth**: NextAuth v5 (prepared for OAuth)
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and setup the project:**
   ```bash
   cd todo-multi-users
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your database URL:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/todo_multi_users?schema=public"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed with sample data
   npm run db:seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Adding Todos
- Enter a title in the "new todo" field
- Press **Enter** to add the todo
- Add description (optional) - use **Ctrl+Enter** to submit
- Add tags (optional) - press **Enter** to add each tag
- Tags show autocomplete suggestions from existing tags

### Managing Todos
- **Complete**: Check the checkbox to mark as done
- **Edit**: Double-click any todo to edit it
- **Expand Description**: Click on the todo title to show/hide description
- **Filter by Tags**: Click on any tag to add it to the filter
- **Filter by Status**: Check "done" to show only completed todos

### Deleting Todos
- **Soft Delete**: Click "delete" button to mark for deletion (shows strikethrough)
- **Restore**: Click "restore" button to unmark for deletion
- **Permanent Delete**: Click "clear" button to permanently delete all marked todos
- **Confirmation**: A dialog will ask "Removing n todo items?" before permanent deletion

### Tag Management
- **Add Tags**: Type in the tags field and press Enter
- **Remove Tags**: Click the × on any tag chip
- **Filter by Tags**: Click on displayed tags to add to filter
- **Remove Filters**: Click × on filter tags to remove them
- **Tag Overflow**: If more than 3 tags, click "..." to see all tags

## API Endpoints

### Authentication
All API endpoints require authentication (currently using mock session for development).

### Todos
- `GET /api/todos` - Get all todos (with optional filtering)
  - Query params: `tags` (comma-separated), `done` (true/false)
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/[id]` - Update a todo
- `DELETE /api/todos/[id]` - Delete a todo

### Tags
- `GET /api/tags` - Get all unique tags for autocomplete

## Database Schema

### User Model
```prisma
model User {
  id         String   @id @default(cuid())
  email      String?  @unique
  name       String
  image      String?
  provider   String?  // google, github, facebook
  providerId String?
  createdAt  DateTime @default(now())
  
  @@unique([provider, providerId])
}
```

### Todo Model
```prisma
model Todo {
  id          String   @id @default(cuid())
  title       String
  description String?
  tags        String[] // PostgreSQL array
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([createdAt])
}
```

## OAuth Setup (Future)

To enable OAuth authentication:

1. **Get OAuth credentials** from:
   - [Google Cloud Console](https://console.cloud.google.com/)
   - [GitHub Developer Settings](https://github.com/settings/developers)
   - [Facebook Developers](https://developers.facebook.com/)

2. **Add credentials to `.env`:**
   ```env
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   FACEBOOK_CLIENT_ID="your-facebook-client-id"
   FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
   ```

3. **Uncomment providers in `src/lib/auth.ts`:**
   ```typescript
   providers: [
     Google({
       clientId: process.env.GOOGLE_CLIENT_ID!,
       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
     }),
     // ... other providers
   ],
   ```

4. **Update `getCurrentSession()` to use real authentication**

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

### Testing
```bash
# Run API tests
node test-api.js

# Make sure server is running first
npm run dev
```

### Git Tags
The project uses git tags to mark development milestones:
- `v0.1-setup` - Initial project setup
- `v0.2-api` - API routes with validation
- `v0.3-add-todo` - AddTodo component with autocomplete
- `v0.4-filter` - TodoList with filtering
- `v0.5-interactions` - Todo interactions (complete, edit, expand)
- `v0.6-delete` - Soft delete and clear functionality
- `v0.7-styling` - Enhanced styling and UX
- `v0.8-auth-ready` - NextAuth preparation
- `v1.0-complete` - Final version with tests and documentation

## Architecture Notes

- **Global Todos**: Todos are not tied to users - they're shared globally
- **User Association**: Use tags (e.g., "ric", "john") to associate todos with users
- **No Real-time**: Updates require user action (refresh, filter change, CRUD operation)
- **Soft Delete**: Client-side marking with server-side permanent deletion
- **Tag Storage**: PostgreSQL array field for simplicity
- **Authentication**: Currently mock session, ready for OAuth integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational purposes.