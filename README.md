# 🚀 No-Code Developer - AI-Powered Website Builder

> **Complete No-Code Website Development Platform with Advanced AI Integration**

Enterprise-grade website builder enabling users to create, customize, and deploy professional websites without writing code. Built with React 19, Vite, and powered by AI for intelligent design generation and real-time editing.

---

## 📋 Table of Contents
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [🔄 Application Architecture](#-application-architecture)
- [🎨 Core Features](#-core-features)
- [🔌 API Reference](#-api-reference)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

### 🔐 **Authentication System**
- Multi-step signup with OTP email verification
- Secure login with JWT token management
- Google OAuth 2.0 integration
- Password reset with OTP verification
- Protected and public route guards
- Session persistence with HTTP-only cookies

### 🎨 **AI-Powered Dashboard**
- Real-time statistics (Active Sites, AI Generations, Published Sites)
- Recent projects with quick access
- GSAP-powered smooth animations
- Dark/Light theme with persistent preferences
- Quick actions for project management

### 🤖 **Advanced AI Features**
- **AI Website Generation**: Create complete websites from text prompts
- **Conversational Chatbot**: Real-time design modifications via chat
- **Chat History**: Persistent conversation management per project
- **Smart Recommendations**: AI-driven design suggestions
- **Color Palette Generation**: AI-suggested color schemes
- **Template Library**: Industry-specific templates

### 🛠️ **Visual Website Editor**
- **Interactive Element Selection**: Click elements to edit in real-time
- **Properties Panel**: Modify text, styles, attributes, and classes
- **Undo/Redo System**: Full history with persistent state
- **Live Preview**: Real-time iframe rendering
- **Interact Mode Toggle**: Switch between view and edit modes
- **Element Context Menu**: Right-click for quick actions
- **Save/Cancel Functionality**: Persist or discard changes
- **Session-specific Storage**: Isolated projects prevent content bleeding

### 🌐 **Domain & Deployment**
- Subdomain provisioning (yoursite.platform.com)
- Custom domain connection with DNS configuration
- Domain verification system
- SSL certificate integration (planned)

### 📱 **Recent Enhancements**
- ✅ Fixed preview page content isolation (Jan 2026)
- ✅ Implemented save/cancel for element edits (Jan 2026)
- ✅ Fixed interact mode border persistence (Jan 2026)
- ✅ API-driven chat history system (Jan 2026)
- ✅ Total projects count accuracy fix (Jan 2026)
- ✅ Undo/redo state persistence (Jan 2026)

---

## 🛠️ Tech Stack

### **Frontend Core**
- **React 19.2.0** - Latest UI library with concurrent features
- **Vite 7.2.2** - Lightning-fast build tool & HMR
- **React Router DOM 7.9.5** - Declarative routing
- **TailwindCSS 4.1.17** - Utility-first CSS framework

### **UI/UX**
- **Material-UI (@mui/material 7.3.6)** - Component library
- **Lucide React** - 500+ modern icons
- **React Icons** - Comprehensive icon set
- **GSAP 3.14.2** - Professional-grade animations
- **React Simple Typewriter** - Typing effects

### **State & Auth**
- **JWT Decode 4.0.0** - Token parsing & validation
- **JS Cookie 3.0.5** - Cookie management
- **@react-oauth/google 0.13.4** - Google OAuth integration
- **EditorContext** - Custom context for editor state

### **Development Tools**
- **ESLint 9** - Code quality enforcement
- **PostCSS** - CSS transformations
- **Autoprefixer** - Browser compatibility

---

## 📁 Project Structure

```
No_Code_Developer/
│
├── Public/                          # Static assets
│   ├── favicon.ico
│   └── assets/
│
├── src/
│   ├── Components/
│   │   ├── Dashboard/              # Dashboard & Projects
│   │   │   ├── Dashboard.jsx       # Main dashboard with stats
│   │   │   ├── Project.jsx         # All projects view (fixed count)
│   │   │   ├── Setting.jsx         # User settings & preferences
│   │   │   └── Header.jsx          # Dashboard navigation
│   │   │
│   │   ├── SignUp/                 # Registration flow
│   │   │   ├── SignUpFlow.jsx      # Multi-step registration
│   │   │   ├── SignUp.jsx          # Registration form
│   │   │   └── sign-otp.jsx        # OTP verification
│   │   │
│   │   ├── SignIn/                 # Authentication flow
│   │   │   ├── SignInFlow.jsx      # Login flow manager
│   │   │   ├── SignInScreen.jsx    # Login form
│   │   │   ├── ForgotPassword.jsx  # Password reset request
│   │   │   ├── ResetPassword.jsx   # New password setup
│   │   │   └── PasswordSuccess.jsx # Success confirmation
│   │   │
│   │   ├── Home/                   # Landing page
│   │   │   └── Home.jsx            # Public home page
│   │   │
│   │   ├── Recommendation/         # Project workspace
│   │   │   ├── NewProjectModal.jsx # AI project creation
│   │   │   ├── ProjectWorkspace.jsx # Main workspace
│   │   │   ├── ColorSelection.jsx  # Color palette picker
│   │   │   └── TemplateGallery.jsx # Template selection
│   │   │
│   │   ├── Preview/                # Preview system
│   │   │   ├── PreviewPanel.jsx    # Main preview (fixed routing)
│   │   │   ├── ChatPanel.jsx       # AI chat with history
│   │   │   ├── ChatHistory.jsx     # Conversation manager
│   │   │   ├── Header.jsx          # Preview header
│   │   │   ├── BottomToolbar.jsx   # Action toolbar
│   │   │   └── PublishModal.jsx    # Publishing wizard
│   │   │
│   │   ├── Editor/                 # Visual editor
│   │   │   ├── EditorContext.jsx   # Editor state (undo/redo)
│   │   │   ├── EditorCanvas.jsx    # Main canvas
│   │   │   ├── PropertiesPanel.jsx # Element properties (save/cancel)
│   │   │   ├── ElementContextMenu.jsx # Right-click menu
│   │   │   └── initialData.js      # Default editor data
│   │   │
│   │   ├── Domain/                 # Domain management
│   │   │   ├── Dashboard.jsx       # Domain dashboard
│   │   │   ├── ConnectDomain.jsx   # Custom domain setup
│   │   │   └── CustomDomain.jsx    # DNS configuration
│   │   │
│   │   ├── Utils/                  # Utilities
│   │   │   ├── PublicRoute.jsx     # Public route guard
│   │   │   ├── ProtectedRoute.jsx  # Auth route guard
│   │   │   └── iframeCleanup.js    # HTML cleanup utility
│   │   │
│   │   └── common/                 # Shared components
│   │       └── AppAlert.jsx        # Toast notifications
│   │
│   ├── services/                   # API services
│   │   └── api.js                  # Axios configuration
│   │
│   ├── store/                      # State management
│   │   └── editorStore.js          # Editor state (planned)
│   │
│   ├── utils/                      # Helper functions
│   │   └── helpers.js              # Common utilities
│   │
│   ├── App.jsx                     # Main router (fixed navigation)
│   ├── main.jsx                    # Application entry point
│   ├── ThemeProvider.jsx           # Theme context provider
│   └── index.css                   # Global styles & variables
│
├── .env                            # Environment variables
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
└── README.md                       # This file
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ installed
- npm or yarn package manager
- Backend API running (see API_REQUIREMENTS.md)

### **Installation**

```bash
# 1. Clone repository
git clone https://github.com/maulikpagada444/No_Code_Developer.git
cd No_Code_Developer

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:5173
```

### **Environment Variables**

Create `.env` file:

```env
# Backend API
VITE_API_BASE_URL=http://localhost:5000

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### **Available Scripts**

```bash
npm run dev      # Start dev server (hot reload)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Code linting
```

---

## 🔄 Application Architecture

### **Complete User Journey**

```
┌─────────────────────────────────────────────────────────────┐
│                    LANDING PAGE (/home)                     │
│  • Hero section with features                               │
│  • CTA buttons: Sign Up / Sign In                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴───────────────┐
        │                              │
┌───────▼────────┐           ┌─────────▼────────┐
│   SIGN UP      │           │    SIGN IN       │
│  (/signup)     │           │   (/signin)      │
└────────┬───────┘           └─────────┬────────┘
         │                             │
         │ OTP Verification            │ JWT Token
         │ (/signup-otp)               │
         │                             │
         └──────────────┬──────────────┘
                        │
                ┌───────▼────────┐
                │   DASHBOARD    │
                │  (Protected)   │
                └────────┬───────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼────────┐ ┌────▼────┐  ┌───────▼────────┐
│ New Project    │ │All      │  │   Settings     │
│ (AI Modal)     │ │Projects │  │                │
└───────┬────────┘ └─────────┘  └────────────────┘
        │
        │ AI generates website
        │
┌───────▼─────────────────────────────────────────┐
│         PROJECT WORKSPACE                       │
│  • AI Chat with persistent history              │
│  • Live preview iframe                           │
│  • Color palette selection                       │
│  • Template options                              │
└────────┬────────────────────────────────────────┘
         │
         │ Navigate to preview
         │
┌────────▼─────────────────────────────────────────┐
│         PREVIEW PANEL (session-isolated)         │
│  • Interactive element selection (Interact Mode) │
│  • Properties panel (Save/Cancel)                │
│  • Undo/Redo with persistence                    │
│  • Chat history sidebar                          │
│  • Publish/Export options                        │
└────────┬─────────────────────────────────────────┘
         │
         │ Publish website
         │
┌────────▼─────────────────────────────────────────┐
│         DOMAIN MANAGEMENT                        │
│  • Subdomain creation                            │
│  • Custom domain connection                      │
│  • DNS configuration                             │
└──────────────────────────────────────────────────┘
```

---

## 🎨 Core Features

### **1. Visual Editor System**

#### **Element Selection (Interact Mode)**
- Toggle "Interact" mode to enable element selection
- Click any element to select (purple solid border)
- Hover preview (blue dashed border)
- Clean borders removed when mode disabled or navigating away
- IIFE-wrapped injection script prevents multiple initialization

#### **Properties Panel**
Features:
- **Content Editor**: Real-time text editing with debouncing (300ms)
  - Smooth typing experience without cursor jumping
  - Local state management for instant UI feedback
  - Synced to iframe after typing pause
- **Typography**: 
  - Text color picker with smart class replacement
  - Preserves text-size, text-align utilities
  - Only removes actual color classes
  - Font size, weight, alignment controls
- **Styles**: Modify CSS properties (color, background, spacing, etc.)
- **Attributes**: Change HTML attributes (id, href, src, alt, etc.)
- **Classes**: Add/remove CSS classes with real-time preview
- **Save/Cancel**: 
  - Save: Persist changes to localStorage and redirect to dashboard
  - Cancel: Revert to original element state

#### **Undo/Redo System**
- Full history tracking with state snapshots
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- Persistent across page refreshes
- Session-specific storage
- cleanHtmlContent helper removes interaction attributes before saving

#### **Session Isolation**
- Each project uses unique localStorage keys (`editorHtmlContent_${sessionId}`)
- Prevents content bleeding between projects
- Force remount on session change
- Separate keys for HTML, undo/redo history, and sync status

### **2. AI Chat System**

#### **Conversation Management**
```
API Flow:
GET /api/web-generator/conversations/{session_id}
  → Fetch all conversations for sidebar

POST /api/web-generator/conversation/new
  → Create new chat conversation

GET /api/web-generator/conversation/{conversation_id}
  → Load specific conversation messages

DELETE /api/conversations/{conversation_id}
  → Delete conversation
```

#### **Features**
- Persistent chat history per project
- Multiple conversations per project
- AI-powered design modifications
- Real-time preview updates
- Conversation deletion

### **3. Authentication Flow**

#### **Sign Up Process**
```
1. User fills registration form (email, password, name)
   ↓
2. POST /auth/signup → Backend sends OTP to email
   ↓
3. User enters OTP in verification screen
   ↓
4. POST /auth/verify-otp → Backend validates
   ↓
5. JWT tokens stored in cookies
   ↓
6. Redirect to dashboard
```

#### **Password Reset**
```
1. Click "Forgot Password" on login
   ↓
2. Enter email → POST /auth/forgot-password
   ↓
3. Receive OTP via email
   ↓
4. Verify OTP → POST /auth/verify-reset-otp
   ↓
5. Set new password → POST /auth/reset-password
   ↓
6. Success → Redirect to login
```

### **4. Dashboard Features**

#### **Statistics Cards** (GSAP Animated)
- **Active Sites**: Currently live projects
- **AI Generations**: Total AI-generated designs
- **Published Sites**: Deployed websites
- **Trend Indicators**: Growth percentages

#### **Recent Projects**
- Shows latest 5 projects
- Quick access to edit/preview
- Total count shows ALL projects (fixed bug)

#### **Quick Actions**
- **New Project**: Opens AI modal
- **View All**: Navigate to full project list
- **Settings**: User preferences & account

---

## 🔌 API Reference

### **Authentication**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register user, send OTP |
| POST | `/auth/verify-otp` | Verify email with OTP |
| POST | `/auth/login` | Login, return JWT |
| POST | `/auth/forgot-password` | Send reset OTP |
| POST | `/auth/verify-reset-otp` | Verify reset OTP |
| POST | `/auth/reset-password` | Update password |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/user/stats` | Get user statistics |

### **Projects**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/project/list` | Get all user projects |
| POST | `/project/create` | Create new project |
| GET | `/project/{id}` | Get project details |
| PUT | `/project/{id}` | Update project |
| DELETE | `/project/{id}` | Delete project |

### **AI & Chat**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/generate-website` | Generate website from prompt |
| GET | `/api/web-generator/conversations/{session_id}` | Get all conversations |
| POST | `/api/web-generator/conversation/new` | Create new conversation |
| GET | `/api/web-generator/conversation/{conversation_id}` | Get conversation messages |
| DELETE | `/api/conversations/{conversation_id}` | Delete conversation |

### **Domain**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/domain/create-subdomain` | Create subdomain |
| POST | `/domain/verify-domain` | Verify custom domain |
| POST | `/domain/connect-custom` | Connect custom domain |

---

## 🤝 Contributing

```bash
# 1. Fork the repository
# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Commit changes
git commit -m 'Add amazing feature'

# 4. Push to branch
git push origin feature/amazing-feature

# 5. Open Pull Request
```

### **Code Style Guidelines**
- Use functional components with hooks
- Follow React best practices
- TailwindCSS for styling (avoid inline styles)
- Add GSAP for animations
- Handle errors gracefully
- Write descriptive commit messages

---

## 📝 Recent Fixes & Improvements

### **January 7, 2026 Updates**
✅ **Edit Element Functionality** - Fixed interaction mode and element click handling  
✅ **Real-Time Text Editing** - Smooth typing without cursor jumping (debounced updates)  
✅ **Color Picker** - Fixed text color application with smart class replacement  
✅ **Dashboard Animations** - Optimized New Project card entrance (smooth slide-in)  
✅ **Project Opening** - Added code fetching to All Projects page cards  
✅ **Dropdown Menus** - Fixed z-index so delete/rename options show above cards  
✅ **Auto Dashboard Redirect** - Save button redirects to dashboard after 1.5s  

### **January 2026 Earlier Updates**
✅ **Preview Page Content Isolation** - Fixed localStorage caching issue  
✅ **Save/Cancel Functionality** - Added to properties panel  
✅ **Interact Mode Borders** - Cleaned on mode toggle/navigation  
✅ **API-Driven Chat History** - Persistent conversations  
✅ **Total Projects Count** - Fixed dashboard accuracy  
✅ **Undo/Redo Persistence** - State maintained across refreshes  
✅ **Header Navigation** - Corrected routing issues  

---

## 🎯 Roadmap

- [ ] Drag-and-drop visual builder
- [ ] Component library (buttons, forms, cards)
- [ ] Template marketplace
- [ ] Real-time collaboration (multi-user)
- [ ] Version control for projects
- [ ] Export to HTML/CSS/JS zip
- [ ] SEO optimization tools
- [ ] Analytics dashboard
- [ ] Mobile responsive editor
- [ ] A/B testing features

---

## 📧 Support

For questions or support, contact the development team.

**GitHub**: [maulikpagada444/No_Code_Developer](https://github.com/maulikpagada444/No_Code_Developer)

---

<div align="center">

**Built with ❤️ using React 19, Vite, and AI**

![React](https://img.shields.io/badge/React-19.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-7.2.2-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.17-cyan)
![License](https://img.shields.io/badge/License-Private-red)

</div>