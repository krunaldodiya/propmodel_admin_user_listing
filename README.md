# Express PostgreSQL User API

A simple Express.js API with PostgreSQL database using Knex.js for migrations and query building.

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Git

## Quick Start with Docker

1. **Clone the repository**

```bash
git clone <repository-url>
cd <repository-name>
```

2. **Copy environment file**

```bash
cp .env.example .env
```

3. **Build and start containers**

```bash
# Build and start in detached mode
docker compose up -d

# View logs
docker compose logs -f
```

4. **Run database migrations**

```bash
docker compose exec app npm run migrate
```

## Development Commands

### Docker Commands

```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# Rebuild containers
docker compose up -d --build

# View logs
docker compose logs -f
```

### Database Commands

```bash
# Run migrations
docker compose exec app npm run migrate

# Rollback migrations
docker compose exec app npm run migrate:rollback

# Run seeds
docker compose exec app npm run seed
```

### NPM Commands (Local Development)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test
```

## Project Structure

```
.
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── db/             # Database migrations and seeds
│   ├── middleware/     # Express middlewares
│   ├── routes/         # Route definitions
│   ├── services/       # Business logic
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── .env                # Environment variables
├── .env.example        # Example environment variables
├── docker-compose.yml  # Docker compose configuration
├── Dockerfile         # Docker build instructions
└── package.json       # Project dependencies
```

## Environment Variables

Key environment variables in `.env`:

```env
NODE_ENV=development
PORT=3000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

# userrepo-propmodel
# propmodel_permisssion_roles
# propmodel_permisssion_roles
# sodio-admin-user-listing
