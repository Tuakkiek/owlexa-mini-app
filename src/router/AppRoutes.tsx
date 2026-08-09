import React from "react";
import { Route } from "zmp-ui";
import { Routes } from "react-router-dom";
import { PATHS } from "./routes";
import PublicLayout from "@/layouts/PublicLayout";
import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "@/features/auth/pages/LoginPage";
import HomePage from "@/features/home/pages/HomePage";
import SchedulePage from "@/features/schedule/pages/SchedulePage";
import AttendancePage from "@/features/attendance/pages/AttendancePage";
import AssignmentsPage from "@/features/assignments/pages/AssignmentsPage";
import DocumentsPage from "@/features/documents/pages/DocumentsPage";
import FeesPage from "@/features/fees/pages/FeesPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import SubmissionAttemptPage from "@/features/submission/pages/SubmissionAttemptPage";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path={PATHS.LOGIN}
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        }
      />
      <Route
        path={PATHS.HOME}
        element={
          <ProtectedRoute>
            <MainLayout>
              <HomePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.SCHEDULE}
        element={
          <ProtectedRoute>
            <MainLayout>
              <SchedulePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.ATTENDANCE}
        element={
          <ProtectedRoute>
            <MainLayout>
              <AttendancePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.ASSIGNMENTS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <AssignmentsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.DOCUMENTS}
        element={
          <ProtectedRoute>
            <MainLayout>
              <DocumentsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.ASSIGNMENT_ATTEMPT}
        element={
          <ProtectedRoute>
            <MainLayout>
              <SubmissionAttemptPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.FEES}
        element={
          <ProtectedRoute>
            <MainLayout>
              <FeesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path={PATHS.PROFILE}
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
