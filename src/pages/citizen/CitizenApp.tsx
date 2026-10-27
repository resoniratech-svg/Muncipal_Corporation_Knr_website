import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CitizenHome } from './CitizenHome';
import { ReportWizard } from './ReportWizard';
import { TrackComplaints } from './TrackComplaints';
import { ComplaintDetail } from './ComplaintDetail';
import { WardInfo, Notices, ResolvedGallery } from './CitizenInfoPages';
import { CitizenPage } from '../CitizenPage';

/** Citizen screens, at most two levels deep: Home → (Report | Track → Detail | Ward | Notices | Gallery). */
export const CitizenApp: React.FC = () => (
  <Routes>
    <Route index element={<CitizenHome />} />
    <Route path="report" element={<ReportWizard />} />
    <Route path="track" element={<TrackComplaints />} />
    <Route path="track/:id" element={<ComplaintDetail />} />
    <Route path="ward" element={<WardInfo />} />
    <Route path="notices" element={<Notices />} />
    <Route path="gallery" element={<ResolvedGallery />} />
    {/* Full deck Page 7 portal (ward projects, budgets) */}
    <Route path="portal" element={<CitizenPage />} />
    <Route path="*" element={<Navigate to="/citizen" replace />} />
  </Routes>
);
