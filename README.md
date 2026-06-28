# Step Into Code

is an open, beginner-friendly coding education platform. It requires no account registration and is completely free to use. Anyone can jump straight in and start learning.

## Features

- No sign-up or account required
- Completely free
- Clean, responsive UI built with Tailwind CSS
- Client-side routing with React Router
- Fast development and production builds via Vite
- Deployed on Vercel

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| Linting | ESLint 10 |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Joshua123895/Step-Into-Code.git
cd Step-Into-Code

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
Step-Into-Code/
├── public/          # Static assets
├── src/             # Application source code
├── index.html       # HTML entry point
├── vite.config.js   # Vite configuration
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── vercel.json      # Vercel deployment config
```

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com). The `vercel.json` file handles routing so that React Router works correctly in production.

To deploy your own instance:

1. Fork this repository
2. Import the project into Vercel
3. Deploy. No additional configuration needed

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the project
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request