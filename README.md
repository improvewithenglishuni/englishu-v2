# EnglishU

A web app to help students prepare for Israel's **AmirNet** English proficiency exam.

> Status: early setup. Right now the app is just a homepage. There is no login,
> database, payments, or exam content yet.

## Tech stack

- [Next.js](https://nextjs.org) (App Router): the web framework
- [TypeScript](https://www.typescriptlang.org): JavaScript with type checking
- [Tailwind CSS](https://tailwindcss.com): styling with utility classes
- [npm](https://www.npmjs.com): installs packages and runs scripts

## Getting started

You need [Node.js](https://nodejs.org) version 20.9 or newer (npm comes with it).
Check your version with `node -v`.

```bash
# 1. Get the code
git clone https://github.com/improvewithenglishuni/englishu-v2.git
cd englishu-v2

# 2. Install dependencies (creates the node_modules folder)
npm install

# 3. Start the development server
npm run dev
```

Then open <http://localhost:3000> in your browser. The page reloads
automatically when you save a file.

## Useful commands

| Command         | What it does                                                 |
| --------------- | ------------------------------------------------------------ |
| `npm run dev`   | Runs the app locally for development                         |
| `npm run build` | Builds an optimized production version and checks for errors |
| `npm run start` | Runs the production build (run `npm run build` first)        |
| `npm run lint`  | Checks the code for common mistakes                          |

## Project structure

```
src/
  app/
    layout.tsx    # Wraps every page: <html>, fonts, page title
    page.tsx      # The homepage (the "/" route)
    globals.css   # Global styles and the colour palette
    favicon.ico   # Browser tab icon
```

With the App Router, each folder inside `src/app/` becomes a URL. For example,
a future `src/app/practice/page.tsx` would show up at `/practice`.

## Colours

The palette lives at the top of `src/app/globals.css`:

- `--background`: warm off-white
- `--foreground`: dark text
- `--accent`: subtle yellow

Tailwind classes such as `bg-background`, `text-foreground`, and `bg-accent`
use these values, so you can change a colour in one place.
