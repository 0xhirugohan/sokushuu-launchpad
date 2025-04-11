# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Getting Started

Copy example env file and replace the value

```bash
cp packages/app/.env.example packages/app/.dev.vars.dev
```

### Installation

Install the dependencies:

```bash
bun install
```

### Development

Start the development server with HMR:

```bash
bun run dev
```

Your application will be available at `http://localhost:5173`.

## Previewing the Production Build

Preview the production build locally:

```bash
bun run preview
```

## Building for Production

Create a production build:

```bash
bun run build
```

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
bun run deploy
```

To deploy a preview URL:

```sh
bun wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
bun wrangler versions deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
