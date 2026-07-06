import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface Doctor {
  id: number;
  docKey: string;
  name: string;
  specialty?: string;
}

interface DoctorSelectorProps {
  onSelectDoctor: (docKey: string | null) => void;
  selectedDocKey: string | null;
}

export function DoctorSelector({ onSelectDoctor, selectedDocKey }: DoctorSelectorProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('moaser_admin_token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }

      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-4">
        <p className="text-gray-500">Loading doctors...</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Doctor
      </label>
      <select
        value={selectedDocKey || ''}
        onChange={(e) => onSelectDoctor(e.target.value || null)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Doctors</option>
        {doctors.map((doctor) => (
          <option key={doctor.docKey} value={doctor.docKey}>
            {doctor.name} {doctor.specialty ? `(${doctor.specialty})` : ''}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </Card>
  );
}
