import { useState } from "react";
import DriversServices from "../../../services/drivers.services.js";
import DriverForm from "./../../../components/dashboardForms/DriverForm.jsx";
import BackButton from "../../../components/BackButton.jsx";
import * as helpers from "../../../utils/helpers.js";
import { useRedirectToTab } from "../../../hooks/useRedirectToTab.js";
import { useAlert } from "../../../context/AlertContext.jsx";
import { useDialog } from "../../../context/DialogContext.jsx";

function DriverCreate() {
  const [errorsForm, setErrors] = useState({});
  const redirectToTab = useRedirectToTab();
  const { showAlert } = useAlert();
  const { confirmDialog } = useDialog();

  async function handleCreate(driverData, imageFile) {
    try {
      const dialog = {
        title: `¿Deseas crear el piloto ${driverData.full_name}?`,
        message: "Se creará un nuevo piloto.",
        confirmText: "Crear",
        cancelText: "Cancelar",
        confirmVariant: "success",
      };

      const confirmed = await confirmDialog(dialog);
      if (!confirmed) return;

      const formData = new FormData();
      Object.entries(driverData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await DriversServices.createDriver(formData);

      showAlert(
        `Piloto ${driverData.full_name} creado con éxito`,
        "success"
      );
      redirectToTab("Pilotos");

    } catch (error) {
      if (!error) return;
      const parsedErrors = helpers.parseErrorMessage(error);
      setErrors(parsedErrors);
      showAlert("Ups! parece que hay campos incompletos.", "danger", true);
    }
  }

  return (
    <main>
      <section className="auth-section page-section container text-center">
        <div className="auth-container auth-container-admin">
          <BackButton to="/admin/dashboard?tab=Pilotos" text="Volver a pilotos" />
          <header className="page-header">
            <p className="section-label">Añadí un nuevo piloto al sistema</p>
            <h1 className="section-title">NUEVO PILOTO</h1>
            <p className="section-subtitle">
              Completá los datos del piloto para incluirlo en las predicciones.
            </p>
          </header>

          <DriverForm
            onSubmit={handleCreate}
            submitLabel="Crear"
            errorsForm={errorsForm}
          />
        </div>
      </section>
    </main>
  );
}

export default DriverCreate;
