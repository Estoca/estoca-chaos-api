# Estoca Mock API Frontend

This is the frontend application for the Estoca Mock API, built with Next.js and Shadcn/UI.

## Features

- Modern and responsive UI using Tailwind CSS
- Dark mode support
- Toast notifications
- Type-safe development with TypeScript
- Component library with Shadcn/UI
- Authentication with NextAuth.js
- API integration with React Query

## Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Create a `.env.local` file in the frontend directory and add the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   │   ├── common/      # Shared components
│   │   ├── layout/      # Layout components
│   │   ├── providers/   # Context providers
│   │   └── ui/          # Shadcn/UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── services/        # API services
│   ├── store/           # State management
│   ├── styles/          # Global styles
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
├── public/              # Static assets
└── package.json         # Dependencies and scripts
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License. 