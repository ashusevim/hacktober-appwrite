# Online Portfolio Builder with Appwrite Backend

## Project Overview
The Online Portfolio Builder is a web application that enables creatives—such as designers, developers, photographers, and artists—to create, customize, and showcase their professional work portfolios. This project leverages Appwrite's powerful backend services, including authentication, database, and file storage, to provide a seamless, secure, and scalable user experience.

## Features

### User Authentication
- Secure sign-up and login using Appwrite Authentication
- Profile management with options to update personal information

### Portfolio Management
- Users can create multiple projects/works with descriptions and media
- Upload images, videos, and documents using Appwrite Storage
- Edit, delete, or rearrange projects easily

### Customizable Templates
- Multiple portfolio templates/themes to choose from
- Responsive design for excellent user experience on all devices

### Access Control
- Set projects or portfolio sections as public or private
- Control who can view the portfolio content using Appwrite's access rules

### Additional Features (Optional)
- Visitor analytics tracking page views and popular projects
- Social media integration to share portfolios seamlessly
- Contact form for potential clients or collaborators to reach out

## Technology Stack
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Appwrite server for authentication, database, storage, and real-time updates
- **Deployment**: Appwrite Cloud or any platform supporting Appwrite SDK

## Project Architecture
- **Authentication Module**: Manages user login and session handling
- **Portfolio CRUD Module**: Handles creating, reading, updating, and deleting portfolio data
- **Media Storage Module**: Uploads and serves project images/videos via Appwrite Storage
- **UI/UX Layer**: Responsive and customizable for an engaging user experience

## Getting Started

### Prerequisites
- Node.js (v14 or higher) and npm installed
- Appwrite account and configured project
- Git installed

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd hacktober-appwrite
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up Appwrite:**
   - Create an account at [Appwrite Cloud](https://cloud.appwrite.io)
   - Create a new project
   - Set up the following:
     - **Database**: Create a database
     - **Collections**: 
       - `users` collection for user profiles
       - `projects` collection for portfolio projects
     - **Storage**: Create a bucket named `media` for file uploads
     - **Authentication**: Enable email/password authentication

4. **Configure environment variables:**
   - Copy `.env` file and update with your Appwrite project details:
   ```bash
   cp .env .env.local
   ```
   - Update the following values in `.env.local`:
   ```
   REACT_APP_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   REACT_APP_APPWRITE_PROJECT_ID=your_project_id_here
   REACT_APP_APPWRITE_DATABASE_ID=your_database_id_here
   REACT_APP_APPWRITE_COLLECTION_USERS=users
   REACT_APP_APPWRITE_COLLECTION_PROJECTS=projects
   REACT_APP_APPWRITE_BUCKET_MEDIA=media
   ```

5. **Set up database collections:**

   **Users Collection:**
   - Collection ID: `users`
   - Permissions: Read/Write for authenticated users
   - Attributes:
     - `name` (String, 255 chars, required)
     - `email` (String, 255 chars, required)
     - `bio` (String, 1000 chars, optional)
     - `avatar` (String, 255 chars, optional)
     - `website` (String, 255 chars, optional)
     - `socialLinks` (String, JSON format, optional)

   **Projects Collection:**
   - Collection ID: `projects`
   - Permissions: Read/Write for authenticated users
   - Attributes:
     - `title` (String, 255 chars, required)
     - `description` (String, 2000 chars, required)
     - `category` (String, 100 chars, required)
     - `tags` (String, JSON array format, optional)
     - `images` (String, JSON array format, optional)
     - `videos` (String, JSON array format, optional)
     - `documents` (String, JSON array format, optional)
     - `isPublic` (Boolean, required)
     - `featured` (Boolean, required)
     - `order` (Integer, required)
     - `userId` (String, 255 chars, required)

6. **Start the development server:**
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Project Structure
```
src/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard component
│   ├── Login.tsx       # Login form component
│   ├── Register.tsx    # Registration form component
│   ├── ProjectCard.tsx # Project display card
│   └── ProjectForm.tsx # Project creation/editing form
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication context and hook
│   └── usePortfolio.tsx # Portfolio management context and hook
├── services/           # API services
│   ├── appwrite.ts     # Appwrite client configuration
│   ├── auth.ts         # Authentication service
│   └── portfolio.ts    # Portfolio management service
├── types/              # TypeScript type definitions
│   └── index.ts        # Main type definitions
└── pages/              # Page components (for future expansion)
```

## Usage

1. **Register/Login**: Create an account or sign in with existing credentials
2. **Create Projects**: Add new portfolio projects with descriptions, categories, and tags
3. **Manage Projects**: Edit, delete, or reorder your projects
4. **Set Visibility**: Make projects public or private
5. **Upload Media**: Add images, videos, and documents to your projects

## Development

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Adding New Features
1. Create components in `src/components/`
2. Add services in `src/services/`
3. Update types in `src/types/`
4. Add custom hooks in `src/hooks/`

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
This project is open source and available under the [MIT License](LICENSE).