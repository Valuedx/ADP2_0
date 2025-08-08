# AI Document Processor 2.0

This repository combines a production ready backend and a React based frontend for processing documents with AI and returning structured JSON output.  The project was built to showcase how PDFs and images can be uploaded, analysed with Google Vertex AI and delivered back to the user with rich usage analytics and access control.

## Contents

- **`experiencecentrejsononly-main/`** – Django REST API that performs document extraction with Vertex AI, stores results in PostgreSQL and enforces a three tier user system.
- **`ADPfrontendfor-jsonly-main/`** – React + TypeScript interface built with Vite and Tailwind that lets users upload files, view extraction results and manage their usage.

Both sub‑projects have their own README files with deeper technical documentation.  This top level guide explains how the pieces fit together and how to get a development environment running.

## Features

### Backend
- Upload PDFs or images and extract structured JSON using Google Vertex AI's Gemini models.
- JWT based authentication with three user types: Default, Power and Admin, each with configurable document and page limits.
- Real time streaming progress updates during document processing.
- Usage tracking, rate limiting and admin dashboards for monitoring and user promotion.
- Fernet encrypted document identifiers and detailed logging for auditing.

### Frontend
- Email / password authentication and password reset flows.
- Drag‑and‑drop uploader for PDFs and images.
- Side‑by‑side document viewer and JSON output viewer with download option.
- Token usage display and dashboards for both normal users and administrators.

## Repository Layout

```
ADP2_0/
├── ADPfrontendfor-jsonly-main/       # React frontend application
├── experiencecentrejsononly-main/   # Django backend API
└── README.md                        # This file
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL database
- Google Cloud account with Vertex AI enabled and a service account key

## Quick Start

### 1. Clone the repository
```bash
git clone <repo-url>
cd ADP2_0
```

### 2. Backend Setup (`experiencecentrejsononly-main`)
```bash
cd experiencecentrejsononly-main
python3 -m venv venv
source venv/bin/activate  # On Windows use venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # fill in database and Vertex AI settings
python manage.py migrate
python manage.py createsuperuser  # optional, for admin access
python manage.py runserver        # starts API at http://localhost:8000
```

Important environment variables:
```env
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
LOCATION=us-central1
MODEL_ID=gemini-1.5-flash
SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account.json
FERNET_KEY=your_fernet_key
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup (`ADPfrontendfor-jsonly-main`)
```bash
cd ../ADPfrontendfor-jsonly-main
npm install
# update src/config.ts to point API_BASE_URL and IMG_BASE_URL to the backend
npm run dev        # serves UI at http://localhost:5173
```

To create a production build use `npm run build` and preview with `npm run preview`.

## Running Tests

Each project exposes its own checks.  From the repository root run:

```bash
# Backend tests
cd experiencecentrejsononly-main && python manage.py test

# Frontend tests
cd ../ADPfrontendfor-jsonly-main && npm test
```

If no tests are defined the commands will exit without running any, which is expected for development snapshots.

## Contributing

Issues and pull requests are welcome.  When contributing code, run the linters/tests above and follow the coding styles described in the sub‑project READMEs.

## License

This repository is provided as‑is without any warranty.  See individual sub‑project directories for more details or license files.

