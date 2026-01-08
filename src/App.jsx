// import { Routes, Route, Navigate } from 'react-router-dom';
// import Home from './Components/Home/Home';
// import { ThemeProvider } from './ThemeProvider';
// import SignUpFlow from './Components/SignUp/SignUpFlow';
// import SignInFlow from './Components/SignIn/SignInFlow';
// import SignOtp from './Components/SignUp/sign-otp';
// import Dashboard from './Components/Dashboard/Dashboard';
// import Project from './Components/Dashboard/Project';
// import Setting from './Components/Dashboard/Setting';
// import ProjectWorkspace from './Components/Recommendation/ProjectWorkspace';
// import PreviewPanel from './Components/Preview/PreviewPanel';
// import DomainDashboard from './Components/Domain/Dashboard';
// import ConnectDomain from './Components/Domain/ConnectDomain';
// import CustomDomain from './Components/Domain/CustomDomain';
// import ColorSelection from './Components/Recommendation/ColorSelection';
// import NotFound from './Components/NotFound/NotFound';

// function App() {
//   return (
//     <ThemeProvider>
//       <Routes>
//         <Route path="/" element={<Navigate to="/home" replace />} />
//         <Route path="/home" element={<Home />} />
//         <Route path="/signup" element={<SignUpFlow />} />
//         <Route path="/signup-otp" element={<SignOtp />} />
//         <Route path="/signin" element={<SignInFlow />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/dashboard/project" element={<Project />} />
//         <Route path="/dashboard/setting" element={<Setting />} />
//         <Route path="/project/workspace" element={<ProjectWorkspace />} />
//         <Route path="/project/preview" element={<PreviewPanel />} />
//         <Route path="/sub-domain/dashboard" element={<DomainDashboard />} />
//         <Route path="/domain/connect" element={<ConnectDomain />} />
//         <Route path="/domain/custom" element={<CustomDomain />} />
//         <Route path="/color-selection" element={<ColorSelection />} />

//         {/* 404 Not Found - Catch all unmatched routes */}
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </ThemeProvider>
//   );
// }

// export default App;




import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./ThemeProvider";

import Home from "./Components/Home/Home";

import SignUpFlow from "./Components/SignUp/SignUpFlow";
import SignInFlow from "./Components/SignIn/SignInFlow";
import SignOtp from "./Components/SignUp/sign-otp";

import Dashboard from "./Components/Dashboard/Dashboard";
import Project from "./Components/Dashboard/Project";
import Setting from "./Components/Dashboard/Setting";
import ProjectWorkspace from "./Components/Recommendation/ProjectWorkspace";
import PreviewPanel from "./Components/Preview/PreviewPanel";
import DomainDashboard from "./Components/Domain/Dashboard";
import ConnectDomain from "./Components/Domain/ConnectDomain";
import CustomDomain from "./Components/Domain/CustomDomain";
import ColorSelection from "./Components/Recommendation/ColorSelection";

/* ROUTE GUARDS */
import PublicRoute from "./Components/Utils/PublicRoute";
import ProtectedRoute from "./Components/Utils/ProtectedRoute";
import NotFound from './Components/NotFound/NotFound';

function App() {
  return (
    <ThemeProvider>
      <Routes>

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* 404 Not Found - Catch all unmatched routes */ }
        <Route path="*" element={<NotFound />} />

        {/* ================= OPEN ROUTE ================= */}
        <Route path="/home" element={<Home />} />

        {/* ================= AUTH ROUTES ================= */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUpFlow />
            </PublicRoute>
          }
        />

        <Route
          path="/signup-otp"
          element={
            <PublicRoute>
              <SignOtp />
            </PublicRoute>
          }
        />

        <Route
          path="/signin"
          element={
            <PublicRoute>
              <SignInFlow />
            </PublicRoute>
          }
        />

        {/* ================= PROTECTED ROUTES ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/project"
          element={
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/setting"
          element={
            <ProtectedRoute>
              <Setting />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project/workspace"
          element={
            <ProtectedRoute>
              <ProjectWorkspace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project/preview"
          element={
            <ProtectedRoute>
              <PreviewPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sub-domain/dashboard"
          element={
            <ProtectedRoute>
              <DomainDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/domain/connect"
          element={
            <ProtectedRoute>
              <ConnectDomain />
            </ProtectedRoute>
          }
        />

        <Route
          path="/domain/custom"
          element={
            <ProtectedRoute>
              <CustomDomain />
            </ProtectedRoute>
          }
        />

        <Route
          path="/color-selection"
          element={
            <ProtectedRoute>
              <ColorSelection />
            </ProtectedRoute>
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/home" replace />} />

      </Routes>
    </ThemeProvider>
  );
}

export default App;