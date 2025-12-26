# Local407 Frontend

React frontend for the Local407 space management application.

## Features

- User authentication (login/register)
- Locales management
- Reservas (bookings) management
- Invitaciones (invitations) management
- JWT-based authentication
- Responsive design

## Tech Stack

- React 18
- Vite
- React Router DOM
- Axios
- Modern CSS

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running on `http://localhost:8080`

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory (already created):

```
VITE_API_URL=http://localhost:8080
```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Navbar.jsx
│   │   └── PrivateRoute.jsx
│   ├── contexts/        # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Locales.jsx
│   │   ├── Reservas.jsx
│   │   └── Invitaciones.jsx
│   ├── services/       # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── localService.js
│   │   ├── reservaService.js
│   │   └── invitacionService.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── .env
└── package.json
```

## API Integration

The frontend connects to the Spring Boot backend API. Make sure the backend is running before starting the frontend.

### Authentication Flow

1. User registers or logs in
2. JWT token is stored in localStorage
3. Token is automatically included in all API requests
4. Token is validated on protected routes

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT