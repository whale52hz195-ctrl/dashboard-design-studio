# ALKASSER Dashboard

## Project info

**ALKASSER Admin Dashboard** - A comprehensive admin panel for managing platform operations.

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
cd <PROJECT_NAME>

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

## Features

- **User Management**: Manage users, verification, and permissions
- **Host & Agency Management**: Handle host applications and agency operations
- **Financial Operations**: Track coin traders and transactions
- **Content Management**: Manage banners and platform content
- **Engagement Tools**: Songs, gifts, PK battles, slots, and lucky draws
- **Package Management**: Store and VIP packages
- **Support & Reporting**: Feedback system and reporting tools

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Sidebar, TopBar)
│   ├── shared/          # Shared components
│   └── ui/              # UI components
├── pages/               # Page components
├── data/                # Mock data
├── hooks/               # Custom React hooks
└── lib/                 # Utility functions
```

## Development

To start the development server:

```bash
npm run dev
```

To build for production:

```bash
npm run build
```

To run tests:

```bash
npm run test
```
