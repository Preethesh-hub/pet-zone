import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserAppointments, addAppointment, getUserPets } from '../services/db';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isFuture, isPast } from 'date-fns';
import './Appointments.css';

export default function Appointments() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newAppt, setNewAppt] = useState({
    petId: '',
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'vet'
  });

  useEffect(() => {
    async function loadData() {
      if (currentUser) {
        const appts = await getUserAppointments(currentUser.uid);
        const userPets = await getUserPets(currentUser.uid);
        setAppointments(appts);
        setPets(userPets);
        if (userPets.length > 0) setNewAppt(prev => ({ ...prev, petId: userPets[0].id }));
      }
      setLoading(false);
    }
    loadData();
  }, [currentUser]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dateTime = new Date(`${newAppt.date}T${newAppt.time}`);
      const pet = pets.find(p => p.id === newAppt.petId);
      
      await addAppointment({
        userId: currentUser.uid,
        petId: pet.id,
        petName: pet.name,
        title: newAppt.title,
        date: dateTime.toISOString(),
        location: newAppt.location,
        type: newAppt.type,
      });
      
      setIsModalOpen(false);
      const appts = await getUserAppointments(currentUser.uid);
      setAppointments(appts);
    } catch (error) {
      alert("Failed to book appointment");
    }
    setSubmitting(false);
  };

  const upcoming = appointments.filter(a => isFuture(new Date(a.date)));
  const past = appointments.filter(a => isPast(new Date(a.date)));

  return (
    <motion.div 
      className="appointments-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <header className="appointments-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-secondary icon-btn" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1>Appointments</h1>
              <p>Manage your vet visits and grooming sessions.</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Book Manually
          </button>
        </div>
      </header>

      <main style={{ padding: '0 1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Upcoming</h2>
        <div className="appointments-grid" style={{ marginBottom: '3rem' }}>
          {upcoming.length === 0 ? (
            <div className="empty-state glass-panel">
              <CalendarIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No upcoming appointments.</p>
            </div>
          ) : (
            upcoming.map(appt => (
              <motion.div key={appt.id} className="appointment-card glass-panel" layout>
                <div className="appointment-header">
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0' }}>{appt.title}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>For {appt.petName}</div>
                  </div>
                  <span className="appointment-badge">{appt.type}</span>
                </div>
                <div className="appointment-details">
                  <div className="detail-row">
                    <CalendarIcon size={16} />
                    {format(new Date(appt.date), 'EEEE, MMMM do, yyyy')}
                  </div>
                  <div className="detail-row">
                    <Clock size={16} />
                    {format(new Date(appt.date), 'h:mm a')}
                  </div>
                  <div className="detail-row">
                    <MapPin size={16} />
                    {appt.location}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <h2 style={{ marginBottom: '1rem' }}>Past</h2>
        <div className="appointments-grid">
          {past.length === 0 ? (
            <p style={{ color: '#64748b' }}>No past appointments.</p>
          ) : (
            past.map(appt => (
              <motion.div key={appt.id} className="appointment-card past glass-panel" layout>
                <div className="appointment-header">
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0' }}>{appt.title}</h3>
                    <div style={{ fontSize: '0.85rem' }}>For {appt.petName}</div>
                  </div>
                  <span className="appointment-badge">{appt.type}</span>
                </div>
                <div className="appointment-details">
                  <div className="detail-row">
                    <CalendarIcon size={16} />
                    {format(new Date(appt.date), 'MMM do, yyyy')}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Manual Booking Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <h2 style={{ margin: '0 0 1.5rem 0' }}>Add Appointment</h2>
              
              {pets.length === 0 ? (
                <div>
                  <p>You need to add a pet first!</p>
                  <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>Close</button>
                </div>
              ) : (
                <form onSubmit={handleCreate}>
                  <div className="form-group">
                    <label>Which Pet?</label>
                    <select 
                      required 
                      value={newAppt.petId} 
                      onChange={(e) => setNewAppt({...newAppt, petId: e.target.value})}
                    >
                      {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Title / Reason</label>
                    <input 
                      type="text" required 
                      placeholder="e.g. Annual Checkup"
                      value={newAppt.title}
                      onChange={(e) => setNewAppt({...newAppt, title: e.target.value})}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Date</label>
                      <input 
                        type="date" required 
                        value={newAppt.date}
                        onChange={(e) => setNewAppt({...newAppt, date: e.target.value})}
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Time</label>
                      <input 
                        type="time" required 
                        value={newAppt.time}
                        onChange={(e) => setNewAppt({...newAppt, time: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select 
                      value={newAppt.type}
                      onChange={(e) => setNewAppt({...newAppt, type: e.target.value})}
                    >
                      <option value="vet">Veterinarian</option>
                      <option value="grooming">Grooming</option>
                      <option value="vaccine">Vaccine</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Location / Clinic Name</label>
                    <input 
                      type="text" required 
                      placeholder="City Vet Clinic"
                      value={newAppt.location}
                      onChange={(e) => setNewAppt({...newAppt, location: e.target.value})}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Saving...' : 'Save Appointment'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
