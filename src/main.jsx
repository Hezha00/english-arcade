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
import SessionGuard from './SessionGuard' // ✅ NEW

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
      <Route
        path="/dashboard"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <Dashboard />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/classrooms"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <Classrooms />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/classrooms/:className"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <ClassroomDetails />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/account-settings"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <AccountSettings />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-games"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <TeacherGamesDashboard />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/game-repository"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <GameRepository />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/assign-game/:gameId"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <AssignGame />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-assignments-list"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <TeacherAssignments />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/add-assignment"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <NewAssignmentForm />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/create-assignment"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <CreateAssignment />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/add-questions"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <AddQuestions />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-assignments"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <TeacherAssignmentsDashboard />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-grading"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <TeacherGradingPanel />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-results-admin"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <TeacherResultsAdmin />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-feedback"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <TeacherFeedbackDashboard />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-analytics"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <TeacherAnalytics />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-dashboard"
        element={
          <SessionGuard>
            <ProtectedRoute>
              <TeacherLayout>
                <TeacherDashboard />
              </TeacherLayout>
            </ProtectedRoute>
          </SessionGuard>
        }
      />

      {/* 🛡️ Admin */}
      <Route path="/admin-create-license" element={<AdminCreateLicense />} />
      <Route path="/admin-license-list" element={<AdminLicenseList />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      {/* 🌍 Wildcard fallback */}
      <Route path="*" element={<LandingScreen />} />
    </Routes>
  </BrowserRouter>
)
