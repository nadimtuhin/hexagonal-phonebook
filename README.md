# Hexagonal Architecture Phonebook

A Next.js phonebook application built with hexagonal architecture (ports and adapters pattern) supporting multiple storage backends.

## Features

- **Hexagonal Architecture**: Clean separation of business logic from infrastructure
- **Multiple Storage Adapters**: SQLite, LocalStorage, and MySQL support
- **TypeScript**: Full type safety across the application
- **Next.js 14**: Modern React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework for styling

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│              (Next.js Pages & Components)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Application Layer                          │
│                  (Use Cases/Services)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Domain Layer                              │
│              (Entities & Business Rules)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Infrastructure Layer                         │
│     ┌──────────┬──────────────┬────────────────┐           │
│     │ SQLite   │ LocalStorage │     MySQL      │           │
│     │ Adapter  │   Adapter    │    Adapter     │           │
│     └──────────┴──────────────┴────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for MySQL adapter)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your preferred database adapter in `.env.local`

### Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm run start
```

## Database Configuration

### SQLite (Default)

No additional setup required. The database file will be created automatically.

```env
DB_ADAPTER=sqlite
SQLITE_PATH=./phonebook.db
```

### LocalStorage

Works only in the browser. Data persists in browser storage.

```env
DB_ADAPTER=localstorage
```

### MySQL

1. Start MySQL using Docker:
   ```bash
   cd docker
   docker-compose up -d
   ```

2. Configure environment:
   ```env
   DB_ADAPTER=mysql
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=phonebook_user
   MYSQL_PASSWORD=phonebook_pass
   MYSQL_DATABASE=phonebook
   ```

## API Endpoints

- `GET /api/contacts` - List all contacts (supports `?q=search` query)
- `POST /api/contacts` - Create a new contact
- `GET /api/contacts/[id]` - Get a specific contact
- `PUT /api/contacts/[id]` - Update a contact
- `DELETE /api/contacts/[id]` - Delete a contact

## Project Structure

```
src/
├── domain/               # Core business logic
│   ├── entities/        # Domain models
│   ├── repositories/    # Repository interfaces (ports)
│   └── value-objects/   # Value objects
├── application/         # Application services
│   ├── use-cases/      # Business use cases
│   └── services/       # Application services
├── infrastructure/      # External adapters
│   ├── adapters/       # Database implementations
│   ├── config/         # Configuration
│   └── factories/      # Factory patterns
├── presentation/        # UI components
│   └── components/     # React components
└── app/                # Next.js app router
    ├── api/           # API routes
    └── page.tsx       # Main page
```

## Testing

The application follows hexagonal architecture principles, making it easy to test business logic independently of infrastructure concerns.

## License

MIT