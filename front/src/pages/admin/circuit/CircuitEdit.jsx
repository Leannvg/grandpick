import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CircuitsServices from "./../../../services/circuits.services.js";
import CircuitForm from "../../../components/dashboardForms/CircuitForm";
import BackButton from "../../../components/BackButton";
import * as helpers from "./../../../utils/helpers.js";
import { useRedirectToTab } from "./../../../hooks/useRedirectToTab.js";
import { useAlert } from "../../../context/AlertContext.jsx";
import { useDialog } from "../../../context/DialogContext.jsx";


function CircuitEdit() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState({});
  const [errorsForm, setErrors] = useState({});
  const redirectToTab = useRedirectToTab();
  const { showAlert } = useAlert();
  const { confirmDialog } = useDialog();


  useEffect(() => {
    CircuitsServices.findOne(id).then(setInitialData);
  }, [id]);

  async function handleEdit(circuitData, imageFile) {
    try {
      const dialog = {
        title: `¿Deseas editar ${circuitData.circuit_name}?`,
        message: "Se actualizarán los cambios realizados.",
        confirmText: "Editar",
        cancelText: "Cancelar",
        confirmVariant: "success",
      }
      const confirmed = await confirmDialog(dialog);
      if (!confirmed) return;

      const formData = new FormData();

      Object.entries(circuitData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await CircuitsServices.updateCircuit(id, formData);

      showAlert(`El circuito ${circuitData.circuit_name} se ha actualizado con éxito`, "success");
      redirectToTab("Circuitos");
    } catch (error) {
      if (!error) return
      const parsedErrors = helpers.parseErrorMessage(error);
      setErrors(parsedErrors);
      showAlert("Ups! parece que hay campos incompletos.", "danger", true);
    }
  }

  return (
    <>
      <section className="auth-section page-section container text-center">
        <div className="auth-container auth-container-admin">
          <BackButton to="/admin/dashboard?tab=Circuitos" text="Volver a circuitos" />
          <header className="page-header">
            <p className="section-label">Modificá los datos del trazado</p>
            <h1 className="section-title">EDITAR CIRCUITO</h1>
            <p className="section-subtitle">
              Actualizá la información del circuito cargado en el sistema.
            </p>
          </header>

          {initialData.circuit_name ? (
            <CircuitForm
              initialData={initialData}
              onSubmit={handleEdit}
              submitLabel="Guardar Cambios"
              isEdit
              errorsForm={errorsForm}
            />
          ) : (
            <p>Cargando datos...</p>
          )}
        </div>
      </section>
    </>
  );
}

export default CircuitEdit;
