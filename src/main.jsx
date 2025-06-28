import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Student pages
import LandingScreen from './pages/LandingScreen'
import StudentLogin from './pages/StudentLogin'
import StudentAssignments from './pages/StudentAssignments'
import StudentQuiz from './pages/StudentQuiz'
import StudentResultsHistory from './pages/StudentResultsHistory'

// Teacher pages
import TeacherAuth from './pages/TeacherAuth'
import CreateAssignment from './pages/CreateAssignment'
import AddQuestions from './pages/AddQuestions'
import TeacherAssignmentsDashboard from './pages/TeacherAssignmentsDashboard'
import TeacherGradingPanel from './pages/TeacherGradingPanel'
import TeacherResultsAdmin from './pages/TeacherResultsAdmin'
import TeacherFeedbackDashboard from './pages/TeacherFeedbackDashboard'
import TeacherAnalytics from './pages/TeacherAnalytics'
import TeacherSubscription from './pages/TeacherSubscription'
import AdminCreateLicense from './pages/AdminCreateLicense'
import AdminLicenseList from './pages/AdminLicenseList'
import AdminDashboard from './pages/AdminDashboard'
import TeacherSignup from './pages/TeacherSignup'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <BrowserRouter>
    <Routes>
      {/* 🔸 Landing */}
      <Route path="/" element={<LandingScreen />} />

      {/* 🧑‍🎓 Student Routes */}
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-assignments" element={<StudentAssignments />} />
      <Route path="/student-quiz/:assignmentId" element={<StudentQuiz />} />
      <Route path="/student-results" element={<StudentResultsHistory />} />

      {/* 🧑‍🏫 Teacher Routes */}
      <Route path="/teacher-login" element={<TeacherAuth />} />
      <Route path="/create-assignment" element={<CreateAssignment />} />
      <Route path="/add-questions" element={<AddQuestions />} />
      <Route path="/teacher-assignments" element={<TeacherAssignmentsDashboard />} />
      <Route path="/teacher-grading" element={<TeacherGradingPanel />} />
      <Route path="/teacher-results-admin" element={<TeacherResultsAdmin />} />
      <Route path="/teacher-feedback" element={<TeacherFeedbackDashboard />} />
      <Route path="/admin-create-license" element={<AdminCreateLicense />} />
      <Route path="/renew-subscription" element={<TeacherSubscription />} />
      <Route path="/teacher-signup" element={<TeacherSignup />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/admin-license-list" element={<AdminLicenseList />} />
      <Route path="/teacher-analytics" element={<TeacherAnalytics />} />
      <Route path="/teacher-subscription" element={<TeacherSubscription />} />
    </Routes>
  </BrowserRouter>
)

