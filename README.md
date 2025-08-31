# Thanacare Frontend

A modern healthcare platform frontend built with Next.js, featuring Redux state management and dark theme support.

## Features

- 🔐 **Authentication**: Secure login system with Redux state management
- 🎨 **Dark Theme**: Full dark/light theme support with system preference detection
- 🐳 **Docker Support**: Production-ready containerization
- ⚡ **Modern Stack**: Next.js 15, React 19, TypeScript, and Tailwind CSS
- 📱 **Responsive Design**: Mobile-first design with shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory:

````env
NEXT_PUBLIC_THANACARE_BACKEND=http://localhost:8080

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
````

Open [http://localhost:3000](http://localhost:3000) with your browser. The app will automatically redirect to the login page.

### Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t thanacare-frontend .

# Run the container
docker run -p 3000:3000 -e NEXT_PUBLIC_THANACARE_BACKEND=http://your-backend-url thanacare-frontend
```

Or use Docker Compose:

```bash
docker-compose up --build
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
