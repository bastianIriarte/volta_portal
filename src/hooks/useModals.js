// hooks/useModals.js
import { useState } from "react";

export function useModals() {
  const [modals, setModals] = useState({
    confirm: null,
    notify: null,
    form: null,
    preview: null
  });

  const openConfirm = (config) => {
    setModals(prev => ({ ...prev, confirm: config }));
  };

  const openNotify = (config) => {
    setModals(prev => ({ ...prev, notify: config }));
  };

  const openForm = (config) => {
    setModals(prev => ({ ...prev, form: config }));
  };

  const openPreview = (data) => {
    setModals(prev => ({ ...prev, preview: data }));
  };

  const closeModal = (type) => {
    setModals(prev => ({ ...prev, [type]: null }));
  };

  const closeAllModals = () => {
    setModals({
      confirm: null,
      notify: null,
      form: null,
      preview: null
    });
  };

  return {
    modals,
    openConfirm,
    openNotify,
    openForm,
    openPreview,
    closeModal,
    closeAllModals
  };
}