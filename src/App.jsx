import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute, PublicOnlyRoute } from './routes/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorProfile } from './pages/doctor/DoctorProfile';
import { PrescriptionPad } from './pages/doctor/PrescriptionPad';
import { PrescriptionView } from './pages/doctor/PrescriptionView';
import { TemplateManager } from './pages/doctor/TemplateManager';
import { ImmunizationTracker } from './pages/pediatric/ImmunizationTracker';
import { GrowthChart } from './pages/pediatric/GrowthChart';
import { InvoiceDesk } from './pages/billing/InvoiceDesk';
import { InvoiceView } from './pages/billing/InvoiceView';
import { PatientPortal } from './pages/portal/PatientPortal';
import { VideoRoom } from './pages/teleconsultation/VideoRoom';
import { AnalyticsDashboard } from './pages/analytics/AnalyticsDashboard';
import { ReceptionDashboard } from './pages/reception/ReceptionDashboard';
import { ClinicSettings } from './pages/clinic/ClinicSettings';
import { TvDisplay } from './pages/queue/TvDisplay';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClinicProvider>
          <div className="app-container">
            <Routes>
              {/* Fullscreen Standalone Screens */}
              <Route path="/queue/tv-display/:clinicId" element={<TvDisplay />} />
              <Route path="/teleconsultation/room/:meetingId" element={<VideoRoom />} />
              <Route path="/portal/patient/:patientId" element={<PatientPortal />} />

              {/* Standard App Pages with Navbar */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <main className="main-content">
                      <Routes>
                        <Route
                          path="/"
                          element={
                            <ProtectedRoute>
                              <Home />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/doctor/dashboard"
                          element={
                            <ProtectedRoute>
                              <DoctorDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/doctor/profile"
                          element={
                            <ProtectedRoute>
                              <DoctorProfile />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/doctor/prescription/patient/:patientId"
                          element={
                            <ProtectedRoute>
                              <PrescriptionPad />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/doctor/prescription/:appointmentId"
                          element={
                            <ProtectedRoute>
                              <PrescriptionPad />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/doctor/prescription/view/:prescriptionId"
                          element={
                            <ProtectedRoute>
                              <PrescriptionView />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/doctor/templates"
                          element={
                            <ProtectedRoute>
                              <TemplateManager />
                            </ProtectedRoute>
                          }
                        />
                        {/* Pediatric Care Hub */}
                        <Route
                          path="/pediatric/immunization/:patientId"
                          element={
                            <ProtectedRoute>
                              <ImmunizationTracker />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/pediatric/growth/:patientId"
                          element={
                            <ProtectedRoute>
                              <GrowthChart />
                            </ProtectedRoute>
                          }
                        />
                        {/* Clinic Billing & Invoicing */}
                        <Route
                          path="/billing/desk"
                          element={
                            <ProtectedRoute>
                              <InvoiceDesk />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/billing/view/:invoiceId"
                          element={
                            <ProtectedRoute>
                              <InvoiceView />
                            </ProtectedRoute>
                          }
                        />
                        {/* Analytics & Reports */}
                        <Route
                          path="/analytics"
                          element={
                            <ProtectedRoute>
                              <AnalyticsDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/reception/dashboard"
                          element={
                            <ProtectedRoute>
                              <ReceptionDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/clinic/settings"
                          element={
                            <ProtectedRoute>
                              <ClinicSettings />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/login"
                          element={
                            <PublicOnlyRoute>
                              <Login />
                            </PublicOnlyRoute>
                          }
                        />
                        <Route
                          path="/register"
                          element={
                            <PublicOnlyRoute>
                              <Register />
                            </PublicOnlyRoute>
                          }
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </>
                }
              />
            </Routes>
          </div>
        </ClinicProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
