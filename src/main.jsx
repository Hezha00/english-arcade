import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// 🌈 Animation init
import AOS from 'aos'
import 'aos/dist/aos.css'
AOS.init({ duration: 600, once: true })

// Layouts
import TeacherLayout from './components/TeacherLayout'
import StudentAppWrapper from './layouts/StudentAppWrapper'
import ProtectedRoute from './ProtectedRoute'
import SessionGuard from './SessionGuard'

// Student pages
import LandingScreen from './pages/LandingScreen'
import StudentLogin from './pages/StudentLogin'
import StudentDashboard from './pages/StudentDashboard'
import StudentAssignments from './pages/StudentAssignments'
import StudentQuiz from './pages/StudentQuiz'
import StudentResultsHistory from './pages/StudentResultsHistory'
import StudentGames from './pages/StudentGames'
import MemoryPuzzleGame from './pages/MemoryPuzzleGame'
import IndependentLearning from './pages/IndependentLearning';
import IndependentTest from './pages/IndependentTest';
import SelfLearnerLogin from './pages/SelfLearnerLogin';
import SelfLearnerSubscription from './pages/SelfLearnerSubscription';
import SelfLearnerAuthChoice from './pages/SelfLearnerAuthChoice';
import SelfLearnerSignup from './pages/SelfLearnerSignup';
import EmojiWordMatchingGame from './pages/EmojiWordMatchingGame';

// Teacher pages
import TeacherAuth from './pages/TeacherAuth'
import PricingPage from './pages/PricingPage'
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
import CreateGame from './pages/CreateGame'
import GameStore from './pages/GameStore'
import GameDetails from './pages/GameDetails'
import CreateMemoryPuzzleGame from './pages/CreateMemoryPuzzleGame'
import EditGame from './pages/EditGame'

import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
let student = null; // Default to null
try {
  const studentData = localStorage.getItem('student');
  if (studentData) {
    student = JSON.parse(studentData);
  }
} catch (error) {
  console.error("Failed to parse student data from localStorage:", error);
  // student remains null, StudentAppWrapper will redirect to login
}

root.render(
  <BrowserRouter>
    <Routes>
      {/* 🔸 Public Routes */}
      <Route path="/" element={<LandingScreen />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/independent-learning/:book" element={<IndependentLearning />} />
      <Route path="/independent-test/:book" element={<IndependentTest />} />
      <Route path="/self-learner-login" element={<SelfLearnerLogin />} />
      <Route path="/self-learner-subscription" element={<SelfLearnerSubscription />} />
      <Route path="/self-learner-auth" element={<SelfLearnerAuthChoice />} />
      <Route path="/self-learner-signup" element={<SelfLearnerSignup />} />

      {/* 👨‍🎓 Student Dashboard Routes with layout wrapper */}
      <Route
        path="/student-dashboard"
        element={
          <StudentAppWrapper student={student}>
            <StudentDashboard />
          </StudentAppWrapper>
        }
      />
      <Route
        path="/student-assignments"
        element={
          <StudentAppWrapper student={student}>
            <StudentAssignments />
          </StudentAppWrapper>
        }
      />
      <Route
        path="/student-quiz/:gameId"
        element={
          <StudentAppWrapper student={student}>
            <StudentQuiz />
          </StudentAppWrapper>
        }
      />
      <Route
        path="/student-results"
        element={
          <StudentAppWrapper student={student}>
            <StudentResultsHistory />
          </StudentAppWrapper>
        }
      />
      <Route
        path="/student-games"
        element={
          <StudentAppWrapper student={student}>
            <StudentGames />
          </StudentAppWrapper>
        }
      />
      <Route
        path="/memory-puzzle/:gameId"
        element={<MemoryPuzzleGame />}
      />
      <Route
        path="/memory-puzzle-game/:gameId"
        element={<MemoryPuzzleGame />}
      />
      <Route
        path="/emoji-word-matching/:gameId"
        element={
          <StudentAppWrapper student={student}>
            <EmojiWordMatchingGame />
          </StudentAppWrapper>
        }
      />

      {/* 🧑‍🏫 Teacher Public Auth */}
      <Route path="/teacher-login" element={<TeacherAuth />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/teacher-subscription" element={<TeacherSubscription />} />
      <Route path="/renew-subscription" element={<TeacherSubscription />} />

      {/* 🧑‍🏫 Protected Teacher Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <SessionGuard>
            <TeacherLayout>
              <Dashboard />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/classrooms"
        element={
          <SessionGuard>
            <TeacherLayout>
              <Classrooms />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/classrooms/:className"
        element={
          <SessionGuard>
            <TeacherLayout>
              <ClassroomDetails />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/account-settings"
        element={
          <SessionGuard>
            <TeacherLayout>
              <AccountSettings />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-games"
        element={
          <SessionGuard>
            <TeacherLayout>
              <TeacherGamesDashboard />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/game-repository"
        element={
          <SessionGuard>
            <TeacherLayout>
              <GameRepository />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/game-store"
        element={
          <SessionGuard>
            <TeacherLayout>
              <GameStore />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/assign-game/:gameId"
        element={
          <SessionGuard>
            <TeacherLayout>
              <AssignGame />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/create-game"
        element={
          <SessionGuard>
            <TeacherLayout>
              <CreateGame />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-assignments-list"
        element={
          <SessionGuard>
            <TeacherLayout>
              <TeacherAssignments />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/add-assignment"
        element={
          <SessionGuard>
            <TeacherLayout>
              <NewAssignmentForm />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/create-assignment"
        element={
          <SessionGuard>
            <TeacherLayout>
              <CreateAssignment />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/add-questions"
        element={
          <SessionGuard>
            <TeacherLayout>
              <AddQuestions />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-assignments"
        element={
          <SessionGuard>
            <TeacherLayout>
              <TeacherAssignmentsDashboard />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-grading"
        element={
          <SessionGuard>
            <TeacherLayout>
              <TeacherGradingPanel />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-results-admin"
        element={
          <SessionGuard>
            <TeacherLayout>
              <TeacherResultsAdmin />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-feedback"
        element={
          <SessionGuard>
            <TeacherLayout>
              <TeacherFeedbackDashboard />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-analytics"
        element={
          <SessionGuard>
            <TeacherLayout>
              <TeacherAnalytics />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/teacher-dashboard"
        element={
          <SessionGuard>
            <TeacherLayout>
              <TeacherDashboard />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/game-details/:gameId"
        element={
          <SessionGuard>
            <TeacherLayout>
              <GameDetails />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/edit-game/:gameId"
        element={
          <SessionGuard>
            <TeacherLayout>
              <EditGame />
            </TeacherLayout>
          </SessionGuard>
        }
      />
      <Route
        path="/create-memory-puzzle"
        element={
          <SessionGuard>
            <TeacherLayout>
              <CreateMemoryPuzzleGame />
            </TeacherLayout>
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
