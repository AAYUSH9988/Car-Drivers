import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { driverAPI } from '../../services/api';
import { toast } from 'sonner';
import Breadcrumb from '../../components/layout/Breadcrumb';
import DocumentViewer from '../../components/common/DocumentViewer';

const VerifyDriver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    let mounted = true;
    driverAPI.getById(id)
      .then(res => { if (mounted) setDriver(res.data.data); })
      .catch(() => { toast.error('Failed to load driver'); navigate('/drivers'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  const handleApprove = async () => {
    setActioning(true);
    try {
      await driverAPI.approve(id);
      toast.success('Driver approved successfully');
      navigate('/drivers');
    } catch {
      toast.error('Approval failed');
      setActioning(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please enter a reason'); return; }
    setActioning(true);
    try {
      await driverAPI.suspend(id, rejectReason);
      toast.success('Driver suspended');
      navigate('/drivers');
    } catch {
      toast.error('Failed to suspend driver');
      setActioning(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-admin-elevated rounded" />
        <div className="bg-admin-surface border border-admin-border rounded-md h-96" />
      </div>
    );
  }

  if (!driver) return null;
  const user = driver.user || {};
  const docs = driver.documents || {};
  const docList = [
    { label: 'Driver License', url: docs.license },
    { label: 'Insurance Document', url: docs.insurance },
    { label: 'Vehicle Photo', url: docs.vehiclePhoto },
    { label: 'Profile Photo', url: docs.profilePhoto },
  ].filter(d => d.url && d.url !== 'default-profile.jpg' && d.url !== 'default-vehicle.jpg');

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/drivers')} className="p-2 text-admin-text-3 hover:text-admin-text-1 hover:bg-admin-elevated rounded-md transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-admin-text-1">Verify Driver</h1>
          <p className="text-sm text-admin-text-3 mt-0.5">{user.name} · {user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver Info */}
        <div className="bg-admin-surface border border-admin-border rounded-md p-6">
          <h2 className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest mb-4">Applicant Details</h2>
          <div className="space-y-0">
            {[
              ['Name', user.name],
              ['Email', user.email],
              ['Phone', user.phone],
              ['License No.', driver.licenseNumber],
              ['Experience', driver.experience ? `${driver.experience} yrs` : '—'],
              ['Rate', driver.hourlyRate ? `₹${driver.hourlyRate}/hr` : '—'],
              ['Vehicles', driver.vehicleTypes?.join(', ')],
              ['Status', driver.status?.toUpperCase()],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2.5 border-b border-admin-border last:border-0">
                <span className="text-sm text-admin-text-3">{label}</span>
                <span className="text-sm text-admin-text-1 font-medium">{value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-admin-surface border border-admin-border rounded-md p-6">
            <h2 className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest mb-4">Submitted Documents</h2>
            {docList.length === 0 ? (
              <p className="text-sm text-admin-text-3 py-6 text-center">No documents submitted yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {docList.map(doc => (
                  <div
                    key={doc.label}
                    className="border border-admin-border rounded-md overflow-hidden cursor-pointer hover:border-admin-border-alt transition-colors"
                    onClick={() => setPreviewDoc(doc)}
                  >
                    <div className="h-32 bg-admin-elevated overflow-hidden">
                      <img
                        src={doc.url}
                        alt={doc.label}
                        className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                        onError={e => { e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-admin-text-3 text-xs">Preview unavailable</div>'; }}
                      />
                    </div>
                    <div className="flex items-center justify-between px-2.5 py-2">
                      <span className="text-xs text-admin-text-2 truncate">{doc.label}</span>
                      <ExternalLink size={12} className="text-admin-text-3 shrink-0 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {driver.status === 'pending' && (
            <div className="bg-admin-surface border border-admin-border rounded-md p-6">
              <h2 className="text-2xs font-medium text-admin-text-2 uppercase tracking-widest mb-4">Verification Decision</h2>

              {!showRejectForm ? (
                <div className="flex gap-3">
                  <button
                    disabled={actioning}
                    onClick={handleApprove}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={16} /> Approve Driver
                  </button>
                  <button
                    disabled={actioning}
                    onClick={() => setShowRejectForm(true)}
                    className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-md px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-admin-text-2 mb-2">Rejection Reason <span className="text-red-400">*</span></label>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="Explain why the driver application is being rejected…"
                      className="w-full bg-admin-elevated border border-admin-border rounded-md px-3 py-2.5 text-sm text-admin-text-1 placeholder-admin-text-3 outline-none focus:border-admin-border-alt resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      disabled={actioning}
                      onClick={handleReject}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-md px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
                      className="bg-admin-elevated border border-admin-border text-admin-text-1 hover:bg-admin-hover rounded-md px-4 py-2.5 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {driver.status !== 'pending' && (
            <div className="bg-admin-surface border border-admin-border rounded-md px-5 py-4">
              <p className="text-sm text-admin-text-2">
                This driver has already been <span className="font-medium text-admin-text-1">{driver.status}</span>. Use the driver details page to change their status.
              </p>
            </div>
          )}
        </div>
      </div>

      <DocumentViewer doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
};

export default VerifyDriver;
