import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout.jsx';
import Spinner from '../components/Spinner.jsx';
import Modal from '../components/Modal.jsx';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const exams = ['NTS', 'GAT', 'MDCAT', 'CSS/PMS'];

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [targetExam, setTargetExam] = useState(user?.targetExam || 'NTS');
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/progress/dashboard');
        setStats(data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', { name, targetExam });
      updateUser({ name: data.name, targetExam: data.targetExam });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    if (newPwd.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwords don't match");
      return;
    }
    setSavingPwd(true);
    try {
      await api.put('/auth/password', { oldPassword: oldPwd, newPassword: newPwd });
      toast.success('Password changed');
      setOldPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPwd(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await api.delete('/auth/profile');
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Spinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile" subtitle="Manage your account and preferences.">
      <div className="prof-grid">
        <div className="prof-card">
          <h3>Account Info</h3>
          <form onSubmit={onSaveProfile}>
            <div className="field">
              <label>Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={user?.email || ''} disabled />
            </div>
            <div className="field">
              <label>Target Exam</label>
              <select value={targetExam} onChange={(e) => setTargetExam(e.target.value)}>
                {exams.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={savingProfile}>
              {savingProfile ? <span className="spinner-sm" /> : 'Save Changes →'}
            </button>
          </form>
        </div>

        <div className="prof-card">
          <h3>Stats Summary</h3>
          <div className="prof-stats">
            <div className="prof-stat">
              <div className="mono prof-stat-label">Total Sessions</div>
              <div className="prof-stat-num">{stats?.totalSessions || 0}</div>
            </div>
            <div className="prof-stat">
              <div className="mono prof-stat-label">Avg Score</div>
              <div className="prof-stat-num">{stats?.avgScore || 0}%</div>
            </div>
            <div className="prof-stat">
              <div className="mono prof-stat-label">Best Score</div>
              <div className="prof-stat-num">{stats?.bestScore || 0}%</div>
            </div>
            <div className="prof-stat">
              <div className="mono prof-stat-label">Streak</div>
              <div className="prof-stat-num">🔥 {stats?.streak || 0}</div>
            </div>
          </div>
        </div>

        <div className="prof-card">
          <h3>Change Password</h3>
          <form onSubmit={onChangePassword}>
            <div className="field">
              <label>Current Password</label>
              <input
                type="password"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>New Password</label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-dark" type="submit" disabled={savingPwd}>
              {savingPwd ? <span className="spinner-sm" /> : 'Update Password →'}
            </button>
          </form>
        </div>

        <div className="prof-card prof-card-danger">
          <h3>Danger Zone</h3>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: 12 }}>
            Permanently delete your account and all session data. This action cannot be undone.
          </p>
          <button className="btn btn-danger" onClick={() => setDeleteOpen(true)}>
            Delete Account
          </button>
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete account?"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={onDelete} disabled={deleting}>
              {deleting ? <span className="spinner-sm" /> : 'Yes, delete'}
            </button>
          </>
        }
      >
        <p>
          Are you sure? All your sessions, stats and progress will be permanently removed.
        </p>
      </Modal>

      <style>{`
        .prof-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .prof-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 28px;
        }
        .prof-card h3 {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 18px;
        }
        .prof-card-danger {
          border-color: var(--error-border);
        }
        .prof-card-danger h3 { color: var(--error); }
        .prof-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .prof-stat {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 14px;
        }
        .prof-stat-label {
          font-size: 0.7rem;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
        }
        .prof-stat-num {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 700;
        }
        .btn-danger {
          background: var(--error);
          color: var(--card);
        }
        .btn-danger:hover {
          opacity: 0.88;
          transform: translateY(-2px);
        }
        @media (max-width: 900px) {
          .prof-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </DashboardLayout>
  );
}
