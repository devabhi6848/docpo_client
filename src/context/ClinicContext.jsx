import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clinicApi } from '../api/clinicApi';
import { useAuth } from '../hooks/useAuth';

const ClinicContext = createContext(null);

export const ClinicProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [activeClinic, setActiveClinic] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchClinics = useCallback(async () => {
    if (!isAuthenticated || user?.role === 'patient') return;
    try {
      setLoading(true);
      const res = await clinicApi.getMyClinics();
      const list = res.data?.clinics || [];
      setClinics(list);

      // Match user's active_clinic_id or pick first available clinic
      if (list.length > 0) {
        const matched = list.find((c) => c._id === user?.active_clinic_id) || list[0];
        setActiveClinic(matched);
      } else {
        setActiveClinic(null);
      }
    } catch (err) {
      console.error('Failed to load user clinics:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role, user?.active_clinic_id]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const switchClinic = async (clinicId) => {
    try {
      await clinicApi.switchActiveClinic(clinicId);
      const selected = clinics.find((c) => c._id === clinicId);
      if (selected) {
        setActiveClinic(selected);
      }
    } catch (err) {
      console.error('Failed to switch active clinic:', err);
      throw err;
    }
  };

  const createClinic = async (data) => {
    const res = await clinicApi.createClinic(data);
    await fetchClinics();
    return res.data?.clinic;
  };

  const updateClinic = async (clinicId, data) => {
    const res = await clinicApi.updateClinic(clinicId, data);
    await fetchClinics();
    return res.data?.clinic;
  };

  return (
    <ClinicContext.Provider
      value={{
        clinics,
        activeClinic,
        loading,
        fetchClinics,
        switchClinic,
        createClinic,
        updateClinic,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
