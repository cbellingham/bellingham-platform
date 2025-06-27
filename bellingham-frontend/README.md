# React + Vite

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

## Setup

Install dependencies:

```bash
npm install
```

During development run:

```bash
npm run dev
```

### API configuration

The frontend expects an API base URL provided via the `VITE_API_BASE_URL`
environment variable. When first setting up the project or deploying,
copy `.env.example` to `.env` and adjust the value for your environment:

```bash
cp .env.example .env
```

For local development the default value is `http://localhost:8080`.

To create a production build:

```bash
npm run build
```

## Tailwind configuration

Tailwind is configured via `tailwind.config.js` and `postcss.config.js`. Global
styles and Tailwind directives are included in `src/index.css` and imported in
`src/main.jsx`.

## Signup and Login

Users can create accounts via the **Sign Up** page at `/signup`. After
registering and logging in, your username appears in the upper-right corner of
all screens while your session is active. Purchases made while logged in are
associated with your account and can be viewed from the **Reports** page.
