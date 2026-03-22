import React, { useState, useEffect } from 'react';
import { Menu, X, Bell, ShieldAlert, LogIn, LogOut } from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from './firebase';
import Dashboard from './components/Dashboard';
import Team from './components/Team';
import Termine from './components/Termine';
import Taktik from './components/Taktik';
import Campus from './components/Campus';
import Admin from './components/Admin';
import { Notification, Player, Coach, TrainingPlan, CampusArticle, Termin, CoachNews, AppUser, PlaybookItem } from './types';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<string>('guest');
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [playbookItems, setPlaybookItems] = useState<PlaybookItem[]>([]);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [campusArticles, setCampusArticles] = useState<CampusArticle[]>([]);
  const [termine, setTermine] = useState<Termin[]>([]);
  const [news, setNews] = useState<CoachNews[]>([]);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          const role = currentUser.email === 'michael.molzar@gmail.com' ? 'admin' : 'guest';
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || 'Unknown',
            role: role
          });
          setUserRole(role);
        } else {
          setUserRole(userDoc.data().role);
        }
      } else {
        setUserRole('guest');
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubPlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player)));
    });
    const unsubCoaches = onSnapshot(collection(db, 'coaches'), (snapshot) => {
      setCoaches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coach)));
    });
    const unsubCampus = onSnapshot(collection(db, 'campus'), (snapshot) => {
      setCampusArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CampusArticle)));
    });
    const unsubTermine = onSnapshot(collection(db, 'termine'), (snapshot) => {
      setTermine(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Termin)));
    });
    const unsubNews = onSnapshot(collection(db, 'news'), (snapshot) => {
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoachNews)));
    });
    const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    return () => {
      unsubPlayers();
      unsubCoaches();
      unsubCampus();
      unsubTermine();
      unsubNews();
      unsubNotifications();
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    let unsubPlaybook: () => void = () => {};
    let unsubTraining: () => void = () => {};
    
    if (userRole === 'player' || userRole === 'coach' || userRole === 'admin') {
      unsubPlaybook = onSnapshot(collection(db, 'playbook'), (snapshot) => {
        setPlaybookItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlaybookItem)));
      });
      unsubTraining = onSnapshot(collection(db, 'trainingPlans'), (snapshot) => {
        setTrainingPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrainingPlan)));
      });
    }

    let unsubUsers: () => void = () => {};
    if (userRole === 'admin') {
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        setAppUsers(snapshot.docs.map(doc => doc.data() as AppUser));
      });
    }

    return () => {
      unsubPlaybook();
      unsubTraining();
      unsubUsers();
    };
  }, [isAuthReady, user, userRole]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const addNotification = async (notif: Omit<Notification, 'id' | 'date' | 'readBy'>) => {
    try {
      const newId = Date.now().toString();
      const newNotif: Notification = { ...notif, id: newId, date: new Date().toISOString(), readBy: [] };
      await setDoc(doc(db, 'notifications', newId), newNotif);
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'notifications', id), {
        readBy: arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = user ? notifications.filter(n => !(n.readBy || []).includes(user.uid)).length : 0;

  const tabs: { id: string; label: string; icon?: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'team', label: 'Team & Werte' },
    { id: 'termine', label: 'Termine' },
    { id: 'campus', label: 'Campus' },
  ];

  if (userRole === 'admin' || userRole === 'coach' || userRole === 'player') {
    tabs.splice(3, 0, { id: 'taktik', label: 'Taktik & Training' });
  }

  if (userRole === 'admin' || userRole === 'coach') {
    tabs.push({ id: 'admin', label: 'Admin', icon: <ShieldAlert size={16} className="mr-1 inline" /> } as any);
  }

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center text-white">Laden...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-dark-card border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Floorballbunnies Logo" className="h-12 w-auto object-contain" onError={(e) => { e.currentTarget.src = '/logo.svg' }} />
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Floorballbunnies</h1>
                <p className="text-xs text-brand uppercase font-semibold">Team Portal</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                    activeTab === tab.id
                      ? 'text-brand bg-gray-800/50'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right Actions (Notifications & Mobile Menu) */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)} 
                  className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-gray-800"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-dark-card">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-dark-card border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                      <h3 className="font-bold text-white">Benachrichtigungen</h3>
                      <button onClick={() => setIsNotifOpen(false)} className="text-gray-400 hover:text-white"><X size={16}/></button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-gray-400 text-center">Keine neuen Nachrichten</p>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => markAsRead(n.id)} 
                            className={`p-3 border-b border-gray-700/50 cursor-pointer transition-colors ${(user && (n.readBy || []).includes(user.uid)) ? 'opacity-60' : 'bg-brand/5 hover:bg-brand/10'}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                n.type === 'alert' ? 'bg-red-500/20 text-red-400' : 
                                n.type === 'event' ? 'bg-purple-500/20 text-purple-400' : 
                                'bg-brand/20 text-brand'
                              }`}>
                                {n.type === 'alert' ? 'Wichtig' : n.type === 'event' ? 'Event' : 'Info'}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {new Date(n.date).toLocaleDateString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-1">{n.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {user ? (
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-300 hover:text-red-400 transition-colors rounded-full hover:bg-gray-800 ml-2"
                  title="Abmelden"
                >
                  <LogOut size={20} />
                </button>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="px-3 py-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-bold rounded-lg transition-colors ml-2 flex items-center"
                >
                  <LogIn size={16} className="mr-1" /> Login
                </button>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-gray-300 hover:text-white focus:outline-none rounded-full hover:bg-gray-800"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-dark-card border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    activeTab === tab.id
                      ? 'text-brand bg-gray-800/50'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} addNotification={addNotification} news={news} termine={termine} userRole={userRole} />}
        {activeTab === 'team' && <Team players={players} setPlayers={setPlayers} />}
        {activeTab === 'termine' && <Termine termine={termine} />}
        {activeTab === 'taktik' && <Taktik trainingPlans={trainingPlans} playbookItems={playbookItems} />}
        {activeTab === 'campus' && <Campus articles={campusArticles} />}
        {activeTab === 'admin' && (
          <Admin 
            players={players} setPlayers={setPlayers}
            coaches={coaches} setCoaches={setCoaches}
            playbookItems={playbookItems} setPlaybookItems={setPlaybookItems}
            trainingPlans={trainingPlans} setTrainingPlans={setTrainingPlans}
            campusArticles={campusArticles} setCampusArticles={setCampusArticles}
            termine={termine} setTermine={setTermine}
            news={news} setNews={setNews}
            appUsers={appUsers}
            currentUserRole={userRole}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-dark-card border-t border-gray-800 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; 2026 Floorballbunnies. Interner Bereich.</p>
          <p className="mt-2">Erstellt für den besten Coach der Liga.</p>
        </div>
      </footer>
    </div>
  );
}
