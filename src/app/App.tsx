import { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { LoginScreen } from './components/LoginScreen';
import { ApartmentsList } from './components/ApartmentsList';
import { ApartmentForm } from './components/ApartmentForm';
import { ApartmentDetail } from './components/ApartmentDetail';
import type { Apartment } from './types';
import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'rental-management-apartments-v2';
const AUTH_KEY = 'rental-management-auth';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | undefined>();
  const [selectedApartment, setSelectedApartment] = useState<Apartment | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const migrateStoredApartments = (stored: string) => {
    try {
      const data = JSON.parse(stored);
      return data.map((apt: any) => ({
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
      })) as Apartment[];
    } catch (e) {
      console.error('Failed to migrate stored apartments:', e);
      return [];
    }
  };

  const loadApartments = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from('apartments')
      .select('id,data');

    if (error) {
      console.error('Supabase read error:', error);
      setErrorMessage('تعذر تحميل البيانات من Supabase؛ يتم استخدام نسخة محلية احتياطية إذا كانت متوفرة.');

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setApartments(migrateStoredApartments(stored));
      }
    } else if (data) {
      setApartments(
        data.map((row: any) => ({
          ...row.data,
          id: row.id,
        })) as Apartment[]
      );
    }

    setIsLoading(false);
  };

  const saveApartmentToSupabase = async (apartment: Apartment) => {
    const { error } = await supabase
      .from('apartments')
      .upsert(
        { id: apartment.id, data: apartment },
        { returning: 'minimal' }
      );

    if (error) {
      console.error('Supabase save error:', error);
      setErrorMessage('فشل حفظ البيانات إلى Supabase. ستبقى التغييرات محلية مؤقتاً.');
    }
  };

  const deleteApartmentFromSupabase = async (id: string) => {
    const { error } = await supabase.from('apartments').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete error:', error);
      setErrorMessage('فشل حذف السجل من Supabase. التغيير محلي فقط.');
    }
  };

  useEffect(() => {
    // Always require PIN on page load — do not restore auth from localStorage
    localStorage.removeItem(AUTH_KEY);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadApartments();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apartments));
    }
  }, [apartments, isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
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

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>جارٍ تحميل الشقق...</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700" dir="rtl">
          <p className="rounded-lg bg-white p-6 shadow-md">جارٍ تحميل البيانات من Supabase...</p>
        </div>
      </>
    );
  }

  const handleSaveApartment = async (apartment: Omit<Apartment, 'id'> & { id?: string }) => {
    const apartmentWithId: Apartment = apartment.id
      ? ({ ...apartment, id: apartment.id } as Apartment)
      : ({ ...apartment, id: Date.now().toString() } as Apartment);

    setApartments((prev) =>
      prev.some((apt) => apt.id === apartmentWithId.id)
        ? prev.map((apt) => (apt.id === apartmentWithId.id ? apartmentWithId : apt))
        : [...prev, apartmentWithId]
    );

    if (selectedApartment?.id === apartmentWithId.id) {
      setSelectedApartment(apartmentWithId);
    }

    setShowForm(false);
    setEditingApartment(undefined);
    await saveApartmentToSupabase(apartmentWithId);
  };

  const handleDeleteApartment = async (id: string) => {
    setApartments((prev) => prev.filter((apt) => apt.id !== id));
    if (selectedApartment?.id === id) {
      setSelectedApartment(undefined);
    }
    await deleteApartmentFromSupabase(id);
  };

  const handleUpdateApartment = async (updatedApartment: Apartment) => {
    setApartments((prev) => prev.map((apt) => (apt.id === updatedApartment.id ? updatedApartment : apt)));
    setSelectedApartment((current) =>
      current?.id === updatedApartment.id ? updatedApartment : current
    );
    await saveApartmentToSupabase(updatedApartment);
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
        {errorMessage && (
          <div className="mx-4 mt-4 rounded-lg border border-yellow-300 bg-yellow-100 p-3 text-sm text-yellow-900" dir="rtl">
            {errorMessage}
          </div>
        )}

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
  const assetBase = import.meta.env.BASE_URL;

  return (
    <HelmetProvider>
      <Helmet>
        <html lang="ar" dir="rtl" />
        <meta name="description" content="نظام إدارة الشقق والإيجارات - تتبع المدفوعات والخدمات" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" type="image/jpeg" href={`${assetBase}logo.jpg`} />
        <link rel="apple-touch-icon" href={`${assetBase}logo.jpg`} />
        <link rel="manifest" href={`${assetBase}manifest.json`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="إدارة الشقق" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      <AppContent />
    </HelmetProvider>
  );
}