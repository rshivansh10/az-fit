# FitAzure - Fitness Tracking Web App

React + Tailwind frontend with Azure Functions backend and Cosmos DB-ready schema.

## Features
- Email/password login and signup
- Post-signup profile setup (height, weight, fat %, muscle mass)
- Smart suggestion categories: Bulking, Cutting, Maintenance
- Strength and cardio workout logging
- Dashboard with last 5 workout logs
- Responsive dark UI with hover/click scale animations

## Run Frontend
```bash
npm install
npm run dev
```

## Run Azure Functions API
```bash
cd api
npm install
func start
```

Frontend API calls are already configured as `/api/...` for Azure Static Web Apps.

## Cosmos DB Schema
See `docs/cosmos-schema.json`.
