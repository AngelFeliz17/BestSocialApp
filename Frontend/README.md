# Social Media App

A modern social media application built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Authentication**: Login and registration with form validation
- **Feed**: View posts from people you follow with likes and comments
- **Profile**: Personal profile page with avatar and user posts
- **Settings**: Update profile information and logout functionality
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Context API** for state management

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd social-media-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Card, Avatar)
│   ├── Navbar.tsx      # Navigation bar
│   ├── PostCard.tsx    # Individual post component
│   ├── CreatePost.tsx  # Post creation form
│   └── ProtectedRoute.tsx # Route protection
├── context/            # React Context for state management
│   ├── AuthContext.tsx # Authentication state
│   └── PostContext.tsx # Posts state
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Feed.tsx        # Main feed page
│   ├── Profile.tsx     # User profile page
│   └── Settings.tsx    # Settings page
├── types/              # TypeScript type definitions
│   └── index.ts        # Main types
├── App.tsx             # Main app component with routing
└── main.tsx            # App entry point
```

## Features Overview

### Authentication
- Secure login and registration forms
- Form validation and error handling
- Persistent login state using localStorage

### Feed
- View posts from followed users
- Like and unlike posts
- Add comments to posts
- Create new posts with text content
- Real-time like and comment counts

### Profile
- View personal profile with avatar
- Display user statistics (followers, following, posts)
- Show all user posts
- Edit profile button linking to settings

### Settings
- Update profile information (username, email, bio, avatar)
- Logout functionality
- Account management options

## Mock Data

The application uses mock data for demonstration purposes:
- Sample users with generated avatars
- Pre-populated posts with likes and comments
- Mock authentication (any email/password combination works)

## Customization

### Styling
The app uses Tailwind CSS with a custom color palette. You can modify the colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom primary colors
      }
    }
  }
}
```

### Adding Features
- Add new pages by creating components in the `pages/` directory
- Extend the type definitions in `types/index.ts`
- Add new context providers for additional state management

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.