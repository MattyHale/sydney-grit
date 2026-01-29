# Sydney Grit

## Project info

This repository contains the Sydney Grit game built with Vite, React, and TypeScript.

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

GitHub Pages can only serve static build output. Do **not** publish the raw source (`src`, `package.json`, etc.) or the site will appear blank. Instead, build the app and deploy the generated files from `dist` (or whatever folder your build produces).

```sh
npm run build
```

After running the build you should have a structure like:

```
dist/
  index.html
  assets/
  ...bundled files...
```

Publish the *contents* of `dist` to the branch/folder GitHub Pages serves (for example, the root of `gh-pages`), or configure your GitHub Actions workflow to publish the `dist` output directory.
