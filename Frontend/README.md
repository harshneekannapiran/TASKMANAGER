# TaskManager - Comprehensive Task Management Application

A modern, feature-rich task management application built with React, featuring authentication, drag-and-drop functionality, calendar view, Pomodoro timer, and more.

## 🚀 Features

### Core Features
- **Authentication**: Secure login/signup with protected routes
- **Task CRUD**: Create, Read, Update, Delete tasks with full functionality
- **Task Assignment**: Assign tasks to other users
- **Filters & Search**: Filter by status, priority, assignee with search functionality
- **Dashboard**: Overview of tasks created/assigned to you
- **Drag and Drop**: Reorder or move tasks using DnD functionality
- **Calendar View**: Visual view of tasks on a calendar
- **Daily Report**: Summary report of daily tasks with productivity insights
- **Pomodoro Timer**: Work-focused timer for productivity
- **Dark/Light Mode**: User-selectable theme toggle

### Advanced Features
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Instant feedback and notifications
- **Data Persistence**: Local storage for task and user data
- **Modern UI/UX**: Beautiful, intuitive interface with smooth animations
- **Accessibility**: Keyboard navigation and screen reader support

## 🛠️ Technology Stack

- **Frontend**: React 19.1.0
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: Date-fns
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- **Calendar**: React Calendar
- **Build Tool**: Vite

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TaskManager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎯 Usage

### Getting Started
1. **Sign Up/Login**: Create an account or log in with existing credentials
2. **Dashboard**: View your task overview and quick actions
3. **Create Tasks**: Add new tasks with title, description, priority, due date, and assignee
4. **Manage Tasks**: Edit, delete, or change status of existing tasks
5. **Calendar View**: See tasks organized by date
6. **Timer**: Use Pomodoro timer for focused work sessions
7. **Reports**: View daily productivity reports and insights

### Key Features Explained

#### Authentication
- Secure user registration and login
- Protected routes ensure only authenticated users can access features
- User data persists across sessions

#### Task Management
- **Create**: Add tasks with detailed information
- **Read**: View tasks in list or calendar format
- **Update**: Modify task details and status
- **Delete**: Remove tasks with confirmation

#### Task Assignment
- Assign tasks to specific users
- Track assigned vs. created tasks
- Filter by assignee

#### Filters & Search
- **Status Filter**: Todo, In Progress, Completed
- **Priority Filter**: High, Medium, Low
- **Assignee Filter**: Filter by who's assigned
- **Search**: Find tasks by title or description
- **Sort**: Sort by date, title, priority, or creation time

#### Dashboard
- Task statistics and overview
- Recent tasks display
- Quick action buttons
- Productivity insights

#### Calendar View
- Monthly calendar display
- Task indicators on dates
- Click dates to view tasks
- Visual task organization

#### Pomodoro Timer
- Configurable work/break sessions
- Session tracking
- Task focus integration
- Progress visualization

#### Daily Reports
- Productivity metrics
- Task completion rates
- Priority distribution
- Personalized recommendations

#### Dark/Light Mode
- Toggle between themes
- Persistent theme preference
- Smooth transitions

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── calendar/       # Calendar view components
│   ├── context/        # React context providers
│   ├── dashboard/      # Dashboard components
│   ├── layout/         # Layout components (Navbar)
│   ├── reports/        # Report components
│   ├── tasks/          # Task-related components
│   └── timer/          # Pomodoro timer components
├── App.jsx            # Main application component
├── index.css          # Global styles with Tailwind
└── main.jsx          # Application entry point
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray scale

### Typography
- **Headings**: Bold, large text for hierarchy
- **Body**: Regular weight for readability
- **Captions**: Smaller text for metadata

### Components
- **Cards**: Rounded corners with shadows
- **Buttons**: Consistent styling with hover states
- **Forms**: Clean input fields with focus states
- **Modals**: Overlay dialogs for actions

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_APP_TITLE=TaskManager
VITE_APP_VERSION=1.0.0
```

### Tailwind Configuration
The application uses Tailwind CSS with custom configuration:
- Dark mode support
- Custom animations
- Responsive breakpoints
- Custom color palette

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`

### Deploy to Netlify
1. Build the project: `npm run build`
2. Drag the `dist` folder to Netlify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons
- Vite for the fast build tool

## 📞 Support

For support, email support@taskmanager.com or create an issue in the repository.

---

**TaskManager** - Organize your life, one task at a time! 🎯
