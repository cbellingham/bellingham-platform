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
`src/main.jsx`. The theme defines custom `base` and `contrast` colors along
with `primary`, `secondary` and `accent` hues. The font family now uses the
Inter web font which is loaded in `index.html`.

## Running tests

Unit tests are written with Vitest and React Testing Library. Execute them with:

```bash
npm test
```
