import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Square } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { taskRepository, grievanceRepository } from '../storage';
import { makeEvidence } from '../photos/photoStore';
import { wardCoords } from '../photos/geo';
import { useTour } from './Tour';
import { useToast } from './Toast';
import { usePrefs } from '../i18n';

interface QuickDemoContextType {
  running: boolean;
  start: () => void;
  stop: () => void;
}

const QuickDemoContext = createContext<QuickDemoContextType>({ running: false, start: () => {}, stop: () => {} });
export const useQuickDemo = () => useContext(QuickDemoContext);

const TOTAL_STEPS = 5;
const scrollTo = (selector: string) =>
  setTimeout(() => document.querySelector(selector)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 600);

/**
 * "Quick Demo" for the officials' presentation: one complete story in about 60 seconds,
 * using the same actions the screens use (no shortcuts in the data).
 */
export const QuickDemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { t } = usePrefs();
  const app = useApp();
  const appRef = useRef(app);
  appRef.current = app;
  const { suppress } = useTour();
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState<{ n: number; text: string } | null>(null);
  const timers = useRef<number[]>([]);

  const stop = useCallback(() => {
    timers.current.forEach((id) => clearTimeout(id));
    timers.current = [];
    setRunning(false);
    setStep(null);
    suppress(false);
  }, [suppress]);

  useEffect(() => stop, [stop]);

  const start = useCallback(() => {
    stop();
    suppress(true);
    setRunning(true);
    const at = (seconds: number, fn: () => void) => timers.current.push(window.setTimeout(fn, seconds * 1000));
    const coords = wardCoords(27);
    const place = 'Near Green Park Colony bus stop, Ward 27 – Green Park Colony';
    let complaintId = '';

    appRef.current.setActiveWardId(27);

    at(0, () => {
      setStep({ n: 1, text: 'A citizen reports a drain overflow and adds a photo.' });
      const created = appRef.current.submitGrievance(
        {
          citizenId: 'USR-CITIZEN-01',
          category: 'Drainage',
          department: 'Engineering',
          description: 'Drain is overflowing near the bus stop (Quick Demo)',
          location: place,
          wardId: 27,
          slaHours: 72,
          latitude: coords.lat,
          longitude: coords.lng,
          beforePhotos: [makeEvidence('images/field-evidence/drain-before.jpg', place, coords.lat, coords.lng)],
        },
        'Sri. P. Rajesh Kumar'
      );
      complaintId = created.id;
      navigate(`/citizen/track/${encodeURIComponent(complaintId)}`);
    });
    at(9, () => {
      setStep({ n: 2, text: 'The ward councillor sees the new complaint and sends it to field staff.' });
      navigate('/ward');
      scrollTo('[data-tour="new-complaints"]');
    });
    at(15, () => {
      appRef.current.routeComplaint(complaintId, 'Ramesh (Field Staff)', 'Sri. K. Ramesh Rao');
      toast('Sent to Ramesh (Field Staff).');
    });
    at(21, () => {
      setStep({ n: 3, text: 'Field staff fix the drain and upload the AFTER photo from the same spot.' });
      navigate('/field-tasks');
      const task = taskRepository.getAll().find((t) => t.grievanceId === complaintId);
      if (task) scrollTo(`[data-task-id="${task.id}"]`);
    });
    at(29, () => {
      const task = taskRepository.getAll().find((t) => t.grievanceId === complaintId);
      if (task) appRef.current.completeTaskWithPhotos(task.id, [makeEvidence('images/field-evidence/drain-after.jpg', place, coords.lat, coords.lng)], 'Drain cleared and cover fixed.');
      toast('After photo uploaded. Waiting for verification.');
    });
    at(35, () => {
      setStep({ n: 4, text: 'The councillor compares the before and after photos and approves.' });
      navigate('/ward');
      scrollTo('[data-tour="verify"]');
    });
    at(43, () => {
      appRef.current.approveAndClose(complaintId, 'Sri. K. Ramesh Rao');
      toast('Approved & closed. SMS sent to the citizen.');
    });
    at(47, () => {
      setStep({ n: 5, text: 'The citizen sees the before/after slider and rates the work.' });
      navigate(`/citizen/track/${encodeURIComponent(complaintId)}`);
    });
    at(56, () => {
      if (grievanceRepository.getById(complaintId)) {
        appRef.current.rateGrievance(complaintId, 5, 'Fixed in one day. Thank you!', 'USR-CITIZEN-01', 'Sri. P. Rajesh Kumar');
      }
      toast('Citizen rated the work 5 stars.');
    });
    at(61, () => {
      stop();
      toast('Quick Demo finished.', 'info');
    });
  }, [navigate, stop, suppress, toast]);

  return (
    <QuickDemoContext.Provider value={{ running, start, stop }}>
      {children}
      {running && step && (
        <div className="fixed top-0 inset-x-0 z-[95] bg-amber-400 text-slate-950 shadow-lg" role="status" aria-live="polite">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <PlayCircle className="w-6 h-6 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-base font-semibold">
              <span className="font-bold">{t('Quick Demo')} {step.n} / {TOTAL_STEPS}:</span> {t(step.text)}
            </p>
            <button type="button" onClick={stop} className="min-h-[44px] px-4 rounded-lg bg-slate-950 text-white text-base font-bold flex items-center gap-2">
              <Square className="w-4 h-4" aria-hidden="true" />
              {t('Stop')}
            </button>
          </div>
        </div>
      )}
    </QuickDemoContext.Provider>
  );
};
