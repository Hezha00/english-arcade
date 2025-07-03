import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Student pages
import LandingScreen from './pages/LandingScreen'
import StudentLogin from './pages/StudentLogin'
import StudentDashboard from './pages/StudentDashboard'
import StudentAssignments from './pages/StudentAssignments'
import StudentQuiz from './pages/StudentQuiz'
import StudentResultsHistory from './pages/StudentResultsHistory'
import StudentGames from './pages/StudentGames'

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
import Dashboard from './pages/Dashboard'
import Classrooms from './pages/Classrooms'
import ClassroomDetails from './pages/ClassroomDetails'
import AccountSettings from './pages/AccountSettings'
import TeacherGamesDashboard from './pages/TeacherGamesDashboard'
import GameRepository from './pages/GameRepository'
import AssignGame from './pages/AssignGame'
import TeacherAssignments from './pages/TeacherAssignments'
import NewAssignmentForm from './pages/NewAssignmentForm'
import TeacherDashboard from './pages/TeacherDashboard'

// Layouts
import TeacherLayout from './components/TeacherLayout'
import ProtectedRoute from './ProtectedRoute'

import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <BrowserRouter>
    <Routes>
      {/* 🔸 Public */}
      <Route path="/" element={<LandingScreen />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/student-assignments" element={<StudentAssignments />} />
      <Route path="/student-quiz/:assignmentId" element={<StudentQuiz />} />
      <Route path="/student-results" element={<StudentResultsHistory />} />
      <Route path="/student-games" element={<StudentGames />} />
      <Route path="/teacher-login" element={<TeacherAuth />} />
      <Route path="/teacher-signup" element={<TeacherSignup />} />
      <Route path="/teacher-subscription" element={<TeacherSubscription />} />
      <Route path="/renew-subscription" element={<TeacherSubscription />} />

      {/* 🧑‍🏫 Protected Teacher Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><TeacherLayout><Dashboard /></TeacherLayout></ProtectedRoute>} />
      <Route path="/classrooms" element={<ProtectedRoute><TeacherLayout><Classrooms /></TeacherLayout></ProtectedRoute>} />
      <Route path="/classrooms/:className" element={<ProtectedRoute><TeacherLayout><ClassroomDetails /></TeacherLayout></ProtectedRoute>} />
      <Route path="/account-settings" element={<ProtectedRoute><TeacherLayout><AccountSettings /></TeacherLayout></ProtectedRoute>} />
      <Route path="/teacher-games" element={<ProtectedRoute><TeacherLayout><TeacherGamesDashboard /></TeacherLayout></ProtectedRoute>} />
      <Route path="/game-repository" element={<ProtectedRoute><TeacherLayout><GameRepository /></TeacherLayout></ProtectedRoute>} />
      <Route path="/assign-game/:gameId" element={<ProtectedRoute><TeacherLayout><AssignGame /></TeacherLayout></ProtectedRoute>} />
      <Route path="/teacher-assignments-list" element={<ProtectedRoute><TeacherLayout><TeacherAssignments /></TeacherLayout></ProtectedRoute>} />
      <Route path="/add-assignment" element={<ProtectedRoute><TeacherLayout><NewAssignmentForm /></TeacherLayout></ProtectedRoute>} />
      <Route path="/create-assignment" element={<ProtectedRoute><TeacherLayout><CreateAssignment /></TeacherLayout></ProtectedRoute>} />
      <Route path="/add-questions" element={<ProtectedRoute><TeacherLayout><AddQuestions /></TeacherLayout></ProtectedRoute>} />
      <Route path="/teacher-assignments" element={<ProtectedRoute><TeacherLayout><TeacherAssignmentsDashboard /></TeacherLayout></ProtectedRoute>} />
      <Route path="/teacher-grading" element={<ProtectedRoute><TeacherLayout><TeacherGradingPanel /></TeacherLayout></ProtectedRoute>} />
      <Route path="/teacher-results-admin" element={<ProtectedRoute><TeacherLayout><TeacherResultsAdmin /></TeacherLayout></ProtectedRoute>} />
      <Route path="/teacher-feedback" element={<ProtectedRoute><TeacherLayout><TeacherFeedbackDashboard /></TeacherLayout></ProtectedRoute>} />
      <Route path="/teacher-analytics" element={<ProtectedRoute><TeacherLayout><TeacherAnalytics /></TeacherLayout></ProtectedRoute>} />
      <Route path="/teacher-dashboard" element={<ProtectedRoute><TeacherLayout><TeacherDashboard /></TeacherLayout></ProtectedRoute>} />

      {/* 🛡️ Admin */}
      <Route path="/admin-create-license" element={<AdminCreateLicense />} />
      <Route path="/admin-license-list" element={<AdminLicenseList />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      {/* 🌍 Wildcard fallback */}
      <Route path="*" element={<LandingScreen />} />
    </Routes>
  </BrowserRouter>
)
