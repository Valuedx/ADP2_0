# ADP Frontend

ADP (AI Document Processor) is a React + TypeScript application that provides a UI for uploading documents, processing them with AI models and viewing the extracted data. The project uses Vite as the build tool and Tailwind CSS with shadcn/ui components for styling.

## Features

- **Authentication** – login flow with role based access for normal users and admins.
- **Password reset** – request a reset link and set a new password.
- **Document upload** – drag & drop or browse to upload PDFs or images.
- **Intelligent processing** – sends documents to a backend API that performs OCR and LLM based extraction.
- **Document viewer** – preview the original file alongside the structured JSON result. Download the JSON output if needed.
- **Token usage tracking** – displays input and output token counts for cost visibility.
- **Dashboards** – separate dashboards for users and administrators. Admins can view usage reports and manage users.

## Project structure

```
├── index.html          # HTML entry point
├── src/                # Application source
│   ├── components/     # React components
│   ├── pages/          # Route level pages
│   ├── store/          # Redux store slices
│   ├── hooks/          # Custom React hooks
│   └── config.ts       # API endpoint configuration
└── package.json        # Project metadata and scripts
```

## Getting started

### Prerequisites

- Node.js (18 or later recommended)
- npm

### Installation

1. Clone the repository
   ```bash
   git clone <REPO_URL>
   cd ADPfrontendfor-jsonly
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Configure the backend API endpoint in `src/config.ts`.
4. Start the development server
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` by default.

### Building for production

```bash
npm run build
```

You can preview the production build with:

```bash
npm run preview
```

## Configuration

All backend URLs are defined in `src/config.ts`. Adjust `API_BASE_URL` and `IMG_BASE_URL` to point to your API server before running the application in production.

Note that `index.html` includes a script from `cdn.gpteng.co` with a comment instructing not to remove it. Keep that comment and script in place.

## Technologies used

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [react-router-dom](https://reactrouter.com/)

## Password reset API

The frontend expects backend routes for requesting and confirming password resets.

Request a reset link:

```bash
curl -X POST http://localhost:8000/IDA/password-reset/ \
  -H "Content-Type: application/json" \
  -d '{"username_or_email": "john@example.com"}'
```

Confirm the reset using the UID and token provided in the email:

```bash
curl -X POST http://localhost:8000/IDA/password-reset-confirm/ \
  -H "Content-Type: application/json" \
  -d '{"uid": "<uid>", "token": "<token>", "password": "NewP@ssw0rd"}'
```

## Contributing

Feel free to open issues or pull requests if you find bugs or have improvements. Make sure to run `npm run lint` before committing to keep code style consistent.

---

This project was initially generated through the Lovable platform.
