import React, { useState } from 'react';
import { BannerStrip } from '../components/common/BannerStrip';
import { FooterStrip } from '../components/common/FooterStrip';
import { useApp } from '../context/AppContext';
import { NotificationItem, NotificationType } from '../data/notifications';
import { 
  Bell, AlertTriangle, Lightbulb, Banknote, MapPin, 
  Send, Smartphone, MessageSquare, Globe, CheckCircle2, ArrowRight 
} from 'lucide-react';
import { SearchableSelect } from '../components/common/SearchableSelect';
import { usePrefs } from '../i18n';

export const NotificationsPage: React.FC = () => {
  const { notifications, broadcastNotification, activeWardId, wards } = useApp();
  const { t } = usePrefs();
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'app' | 'sms' | 'portal'>('all');
  const [filterWard, setFilterWard] = useState<number | 'all'>('all');

  // Form state for broadcasting
  const [broadcastTitle, setBroadcastTitle] = useState('Heavy Rainfall & Flood Alert');
  const [broadcastMessage, setBroadcastMessage] = useState('Heavy rainfall expected in next 24h. Avoid low-lying areas.');
  const [broadcastType, setBroadcastType] = useState<NotificationType>('Emergency');
  const [targetWard, setTargetWard] = useState<number | 'all'>('all');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    broadcastNotification({
      type: broadcastType,
      title: broadcastTitle,
      message: broadcastMessage,
      wardId: targetWard === 'all' ? undefined : Number(targetWard),
      channel: ['app', 'sms', 'portal'],
      smsText: `Municipal Corporation, Karimnagar: ${broadcastMessage} – MCKNRG`,
      urgency: broadcastType === 'Emergency' ? 'high' : 'info',
    });
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterWard !== 'all' && n.wardId && n.wardId !== Number(filterWard)) return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-kmc-bg">
      <BannerStrip
        title={t("8. Government Communication & Public Notification System")}
        tagline={t("Informed Citizens. Transparent Governance. Stronger Community.")}
        actionButton={
          <span className="text-xs bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-md shadow uppercase tracking-wide">
            {t("Multi-Channel Broadcast")}
          </span>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 w-full">
        
        {/* Live Multi-Channel Simulator: Admin Broadcast Tool & Live Channels */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Admin Broadcast Tool */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-card border border-slate-200 p-5">
            <div className="border-b border-slate-100 pb-2 mb-3">
              <span className="text-[11px] uppercase font-bold text-kmc-navy bg-blue-50 px-2 py-0.5 rounded">
                {t("Admin Console")}
              </span>
              <h4 className="text-xs font-bold font-heading uppercase text-slate-800 mt-1">
                {t("Dispatch Public Broadcast")}
              </h4>
              <p className="text-[11px] text-slate-500">
                {t("Pushes simultaneously to Mobile Push, SMS (\"VM-MCKNRG\"), and Portal")}
              </p>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {t("Alert Category")}
                </label>
                <SearchableSelect
                  value={broadcastType}
                  onChange={(val) => setBroadcastType(val as NotificationType)}
                  searchPlaceholder={t("Search category...")}
                  options={[
                    { value: 'Emergency', label: t("Emergency Alert"), badge: t("High Priority") },
                    { value: 'Scheme', label: t("Scheme / Government Decision") },
                    { value: 'Initiative', label: t("New Development Initiative") },
                    { value: 'Budget', label: t("Fund Allocation Notice") },
                    { value: 'WardUpdate', label: t("Ward-Specific Project Update") },
                  ]}
                  fullWidth
                  size="sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {t("Target Audience")}
                </label>
                <SearchableSelect
                  value={targetWard}
                  onChange={(val) => setTargetWard(val as number | 'all')}
                  searchPlaceholder={t("Search target ward...")}
                  options={[
                    { value: 'all', label: t("Entire City (All 66 Wards)"), badge: t("Broadcast") },
                    ...wards.map(w => ({
                      value: w.id,
                      label: `${t("Ward")} ${w.id} – ${t(w.name)}`,
                    }))
                  ]}
                  fullWidth
                  size="sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {t("Alert Headline / Title")}
                </label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-kmc-navy text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {t("Broadcast Message")}
                </label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-kmc-navy text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 min-h-[36px] bg-kmc-navy hover:bg-kmc-navy-light text-white font-bold rounded-lg shadow uppercase text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t("Dispatch Multi-Channel Broadcast")}</span>
              </button>

              {broadcastSuccess && (
                <div className="p-2 rounded bg-emerald-50 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 animate-fade-in border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t("Broadcast dispatched successfully across App, SMS, and Web Portal!")}</span>
                </div>
              )}
            </form>
          </div>

          {/* Live Channels Stream */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Channel Filters */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">{t("Filter Channel:")}</span>
                <button
                  onClick={() => setSelectedChannel('all')}
                  className={`px-2.5 py-1 min-h-[36px] rounded-lg text-xs font-semibold ${selectedChannel === 'all' ? 'bg-kmc-navy text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {t("All Channels")}
                </button>
                <button
                  onClick={() => setSelectedChannel('app')}
                  className={`px-2.5 py-1 min-h-[36px] rounded-lg text-xs font-semibold ${selectedChannel === 'app' ? 'bg-kmc-navy text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {t("App Push Notifications")}
                </button>
                <button
                  onClick={() => setSelectedChannel('sms')}
                  className={`px-2.5 py-1 min-h-[36px] rounded-lg text-xs font-semibold ${selectedChannel === 'sms' ? 'bg-kmc-navy text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {t("SMS Gateway")}
                </button>
                <button
                  onClick={() => setSelectedChannel('portal')}
                  className={`px-2.5 py-1 min-h-[36px] rounded-lg text-xs font-semibold ${selectedChannel === 'portal' ? 'bg-kmc-navy text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {t("Web Portal")}
                </button>
              </div>

              {/* Ward Filter */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">{t("Ward:")}</span>
                <SearchableSelect
                  value={filterWard}
                  onChange={(val) => setFilterWard(val as number | 'all')}
                  searchPlaceholder={t("Filter by ward...")}
                  options={[
                    { value: 'all', label: t("All Wards") },
                    ...wards.map(w => ({
                      value: w.id,
                      label: `${t("Ward")} ${w.id}`,
                    }))
                  ]}
                  size="sm"
                />
              </div>
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Channel 1: Mobile Push */}
              {(selectedChannel === 'all' || selectedChannel === 'app') && (
                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>{t("Mobile Push Notifications")}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">My Karimnagar</span>
                    </div>

                    <div className="space-y-2.5">
                      {filteredNotifications.slice(0, 3).map((n) => (
                        <div key={n.id} className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-amber-400 uppercase tracking-wide">{t(n.type)}</span>
                            <span className="text-slate-400 text-[10px]">{t(n.timestamp)}</span>
                          </div>
                          <h5 className="font-bold text-xs text-white leading-tight">{t(n.title)}</h5>
                          <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{t(n.message)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 text-center">
                    {t("Instant citizen alert channel")}
                  </div>
                </div>
              )}

              {/* Channel 2: SMS Gateway */}
              {(selectedChannel === 'all' || selectedChannel === 'sms') && (
                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{t("Citizen SMS Gateway")}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">VM-MCKNRG</span>
                    </div>

                    <div className="space-y-2.5">
                      {filteredNotifications.slice(0, 3).map((n) => (
                        <div key={n.id} className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                          <p className="text-[11px] text-slate-200 leading-snug">
                            "{t(n.smsText || `Municipal Corporation, Karimnagar: ${n.message} – MCKNRG`)}"
                          </p>
                          <span className="text-[11px] text-slate-400 block mt-1">{t(n.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 text-center">
                    {t("Non-smartphone & offline reach")}
                  </div>
                </div>
              )}

              {/* Channel 3: Web Portal Announcements */}
              {(selectedChannel === 'all' || selectedChannel === 'portal') && (
                <div className="bg-slate-50 text-slate-900 rounded-2xl p-4 shadow border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 pb-2 mb-3 border-b border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-kmc-navy min-w-0">
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <span>{t("Portal Announcements")}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono truncate min-w-0">karimnagar.gov.in</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {filteredNotifications.slice(0, 4).map((n) => (
                        <div key={n.id} className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                          <span className="text-[11px] font-bold text-kmc-navy bg-blue-50 px-1.5 py-0.2 rounded uppercase">
                            {t(n.type)}
                          </span>
                          <h5 className="font-bold text-[11px] text-slate-900 mt-1">{t(n.title)}</h5>
                          <p className="text-[11px] text-slate-500">{t(n.timestamp)} • {t(n.message.slice(0, 60))}...</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500 text-center">
                    {t("Public Transparency Hub")}
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

      </main>

      <FooterStrip
        tagline={t("Connected Citizens. Engaged Community. Empowered Karimnagar.")}
      />
    </div>
  );
};
