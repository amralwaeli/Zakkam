import { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { LoginScreen } from './components/LoginScreen';
import { ApartmentsList } from './components/ApartmentsList';
import { ApartmentForm } from './components/ApartmentForm';
import { ApartmentDetail } from './components/ApartmentDetail';
import type { Apartment } from './types';

const STORAGE_KEY = 'rental-management-apartments-v2';
const AUTH_KEY = 'rental-management-auth';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | undefined>();
  const [selectedApartment, setSelectedApartment] = useState<Apartment | undefined>();

  useEffect(() => {
    const authStored = localStorage.getItem(AUTH_KEY);
    if (authStored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const migratedData = data.map((apt: any) => ({
          id: apt.id,
          name: apt.name || '',
          totalRent: apt.totalRent || apt.monthlyRent || apt.rooms?.reduce((sum: number, r: any) => sum + (r.rent || 0), 0) || 0,
          paymentDueDayStart: apt.paymentDueDayStart || 1,
          paymentDueDayEnd: apt.paymentDueDayEnd || 5,
          rooms: (apt.rooms || []).map((r: any) => ({
            id: r.id,
            name: r.name || '',
            rent: r.rent || 0,
            tenantName: r.tenantName,
          })),
          payments: (apt.payments || []).map((p: any) => {
            if (p.roomPayments) {
              return p;
            }
            return {
              id: p.id,
              month: p.paymentDate?.substring(0, 7) || new Date().toISOString().substring(0, 7),
              paymentDate: p.paymentDate || new Date().toISOString().split('T')[0],
              roomPayments: [],
              notes: p.notes,
            };
          }),
          utilityBills: (apt.utilityBills || []).map((b: any) => ({
            ...b,
            isPaid: b.isPaid || false,
            hasDiscrepancy: b.hasDiscrepancy || false,
            amountPaid: b.amountPaid || 0,
            amountRemaining: b.amountRemaining || b.amount || 0,
          })),
        }));
        setApartments(migratedData);
      } catch (e) {
        console.error('Failed to load apartments:', e);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apartments));
    }
  }, [apartments, isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, 'true');
  };

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      setIsAuthenticated(false);
      localStorage.removeItem(AUTH_KEY);
      setSelectedApartment(undefined);
      setShowForm(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>نظام إدارة الشقق - تسجيل الدخول</title>
        </Helmet>
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  const handleSaveApartment = (apartment: Omit<Apartment, 'id'> & { id?: string }) => {
    if (apartment.id) {
      setApartments((prev) =>
        prev.map((apt) => (apt.id === apartment.id ? { ...apartment, id: apartment.id } : apt))
      );
      if (selectedApartment?.id === apartment.id) {
        setSelectedApartment({ ...apartment, id: apartment.id } as Apartment);
      }
    } else {
      setApartments((prev) => [...prev, { ...apartment, id: Date.now().toString() }]);
    }
    setShowForm(false);
    setEditingApartment(undefined);
  };

  const handleDeleteApartment = (id: string) => {
    setApartments((prev) => prev.filter((apt) => apt.id !== id));
    if (selectedApartment?.id === id) {
      setSelectedApartment(undefined);
    }
  };

  const handleUpdateApartment = (updatedApartment: Apartment) => {
    setApartments((prev) =>
      prev.map((apt) => (apt.id === updatedApartment.id ? updatedApartment : apt))
    );
    // Update the selected apartment to reflect changes
    const updatedInList = apartments.find(a => a.id === updatedApartment.id);
    if (updatedInList) {
      setSelectedApartment(updatedApartment);
    }
  };

  if (selectedApartment) {
    // Always get the latest version from the apartments array
    const currentApt = apartments.find(a => a.id === selectedApartment.id) || selectedApartment;
    return (
      <>
        <Helmet>
          <title>{currentApt.name} - نظام إدارة الشقق</title>
        </Helmet>
        <ApartmentDetail
          apartment={currentApt}
          onBack={() => {
            // When going back, trigger a re-render to update statuses
            setSelectedApartment(undefined);
          }}
          onUpdate={handleUpdateApartment}
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>نظام إدارة الشقق</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <ApartmentsList
          apartments={apartments}
          onAdd={() => setShowForm(true)}
          onEdit={(apartment) => {
            setEditingApartment(apartment);
            setShowForm(true);
          }}
          onDelete={handleDeleteApartment}
          onSelect={setSelectedApartment}
          onLogout={handleLogout}
        />

        {showForm && (
          <ApartmentForm
            apartment={editingApartment}
            onSave={handleSaveApartment}
            onCancel={() => {
              setShowForm(false);
              setEditingApartment(undefined);
            }}
          />
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Helmet>
        <html lang="ar" dir="rtl" />
        <meta name="description" content="نظام إدارة الشقق والإيجارات - تتبع المدفوعات والخدمات" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" type="image/jpeg" href="/logo.jpg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="إدارة الشقق" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      <AppContent />
    </HelmetProvider>
  );
}
