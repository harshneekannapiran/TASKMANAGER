# 🚀 TRILO - Advanced Task Management & Team Collaboration Platform

A modern, feature-rich task management and team collaboration application built with React, Node.js, and MongoDB. TRILO combines powerful task management with intelligent notifications, real-time team collaboration, and comprehensive activity tracking.

## ✨ **Features Overview**

### 🔐 **Core Authentication & User Management**
- **Secure login/signup** with JWT authentication
- **User profiles** with customizable avatars
- **Protected routes** and session management
- **Role-based access control**

### 📋 **Advanced Task Management**
- **Full CRUD operations** for tasks
- **Smart task assignment** to team members
- **Priority levels** (High, Medium, Low)
- **Status tracking** (Todo, In Progress, Completed)
- **Due date management** with intelligent reminders
- **Task categorization** and tagging
- **Drag & Drop** task reordering
- **Bulk operations** for multiple tasks

### 👥 **Team Collaboration System**
- **Team creation** and management
- **Member invitations** with smart notifications
- **Role-based permissions** (Owner, Members)
- **Team-specific task management**
- **Real-time team updates**
- **Member activity tracking**

### 🔔 **Smart Notification System**
- **Intelligent notification badges** in navbar
- **Audio notifications** for new invitations
- **Context-aware notifications** with emojis
- **Real-time updates** every 30 seconds
- **Smart reminders** for task due dates
- **Team invitation notifications**

### 📱 **Notifications Center**
- **Centralized notification hub** (`/notifications`)
- **Advanced filtering** (All, Unread, Team, Tasks)
- **Search functionality** across notifications
- **Priority-based organization** (Urgent, High, Medium, Low)
- **Mark as read/unread** functionality
- **Archive system** for old notifications
- **Direct actions** (Accept/Reject team invitations)

### 📊 **Activity Feed**
- **Real-time activity tracking** (`/activity`)
- **Comprehensive activity statistics**
- **Smart categorization** (Teams, Tasks, Projects)
- **Time-based organization** with "time ago" display
- **Interactive elements** with navigation links
- **Real-time toggle** for live updates
- **Activity insights** and analytics

### 📅 **Calendar & Time Management**
- **Visual calendar view** of all tasks
- **Date-based task organization**
- **Due date reminders** and notifications
- **Time blocking** for focused work
- **Calendar integration** capabilities

### ⏱️ **Productivity Tools**
- **Pomodoro Timer** for focused work sessions
- **Customizable work/break intervals**
- **Session tracking** and completion stats
- **Task-focused timer** integration

### 📈 **Reporting & Analytics**
- **Daily productivity reports**
- **Task completion analytics**
- **Team performance metrics**
- **Personal productivity insights**
- **Export functionality** for reports

### 🎨 **User Experience**
- **Dark/Light theme** toggle
- **Responsive design** for all devices
- **Modern UI/UX** with smooth animations
- **Keyboard shortcuts** for power users
- **Accessibility features** and screen reader support

## 🛠️ **Technology Stack**

### **Frontend**
- **React 19.1.0** - Modern React with hooks
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Elegant notifications
- **Date-fns** - Modern date utility library

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing

### **Development Tools**
- **Vite** - Fast build tool and dev server
- **ESLint** - Code quality and consistency
- **PostCSS & Autoprefixer** - CSS processing
- **Nodemon** - Development server with auto-restart

## 🚀 **Installation & Setup**

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Git

### **1. Clone the Repository**
```bash
git clone <your-repository-url>
cd TRILO
```

### **2. Backend Setup**
```bash
cd Backend
npm install
```

**Environment Variables** - Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trilo
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

**Start Backend Server:**
```bash
npm start
# or for development
npm run dev
```

### **3. Frontend Setup**
```bash
cd Frontend
npm install
```

**Start Frontend Development Server:**
```bash
npm run dev
```

**Build for Production:**
```bash
npm run build
```

## 📱 **Usage Guide**

### **Getting Started**
1. **Sign up** for a new account or **login** with existing credentials
2. **Create your first task** using the task creation form
3. **Set up teams** and invite team members
4. **Explore the dashboard** for an overview of your work

### **Task Management**
- **Create tasks** with titles, descriptions, and due dates
- **Assign tasks** to team members or yourself
- **Track progress** by updating task status
- **Use drag & drop** to reorder tasks
- **Filter and search** through your task list

### **Team Collaboration**
- **Create teams** for different projects or departments
- **Invite members** using their email addresses
- **Manage team permissions** and member roles
- **Collaborate on team-specific tasks**
- **Monitor team activity** in the activity feed

### **Notifications & Updates**
- **Check notification badges** in the navbar
- **Visit the Notifications Center** for comprehensive management
- **Respond to team invitations** directly from notifications
- **Customize notification preferences**
- **Archive old notifications** to keep organized

### **Activity Tracking**
- **Monitor real-time activity** in the Activity Feed
- **View activity statistics** and insights
- **Filter activities** by type and category
- **Navigate to related items** using "View Details" links
- **Toggle real-time updates** on/off as needed

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

### **Tasks**
- `GET /api/v1/tasks` - Get all tasks
- `POST /api/v1/tasks` - Create new task
- `PATCH /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### **Teams**
- `GET /api/v1/teams/owned` - Get owned teams
- `GET /api/v1/teams/joined` - Get joined teams
- `POST /api/v1/teams` - Create new team
- `POST /api/v1/teams/invite` - Invite team member
- `GET /api/v1/teams/invitations` - Get team invitations
- `PATCH /api/v1/teams/invitations/:id` - Respond to invitation

## 🎯 **Key Features in Detail**

### **Smart Notification System**
- **Real-time updates** every 30 seconds
- **Audio notifications** for new invitations
- **Context-aware messages** with relevant emojis
- **Priority-based organization** for urgent items
- **Seamless integration** with existing features

### **Notifications Center**
- **Unified notification management**
- **Advanced search and filtering**
- **Direct action buttons** for quick responses
- **Archive system** for organization
- **Priority indicators** for important notifications

### **Activity Feed**
- **Comprehensive activity tracking**
- **Real-time updates** with toggle control
- **Statistical insights** and metrics
- **Interactive navigation** to related items
- **Category-based organization**

## 🌟 **Why Choose TRILO?**

### **For Individuals**
- **Personal productivity** tracking and management
- **Smart reminders** and notifications
- **Time management** tools and insights
- **Clean, distraction-free** interface

### **For Teams**
- **Seamless collaboration** and communication
- **Real-time updates** and activity tracking
- **Role-based permissions** and access control
- **Team performance** insights and analytics

### **For Organizations**
- **Scalable architecture** for growing teams
- **Professional features** for business use
- **Comprehensive reporting** and analytics
- **Integration-ready** for existing workflows

## 🤝 **Contributing**

We welcome contributions! Please feel free to:
- **Report bugs** and suggest features
- **Submit pull requests** with improvements
- **Share feedback** and ideas
- **Help with documentation**

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS approach
- **Lucide** for the beautiful icon set
- **MongoDB** for the flexible database solution

## 📞 **Support & Contact**

- **GitHub Issues** - For bug reports and feature requests
- **Documentation** - Check this README for usage guides
- **Community** - Join discussions and share experiences

---

**Built with ❤️ for productive teams and individuals**

*TRILO - Where tasks meet teamwork, and productivity meets intelligence.*
