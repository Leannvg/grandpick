import { useState } from "react";
import DriversServices from "../../../services/drivers.services.js";
import DriverForm from "./../../../components/dashboardForms/DriverForm.jsx";
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
        `Piloto ${driverData.full_name} creado con éxito ✅`,
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
    <div className="container mt-4">
      <h2>Crear Nuevo Piloto</h2>
      <DriverForm
        onSubmit={handleCreate}
        submitLabel="Crear"
        errorsForm={errorsForm}
      />
    </div>
  );
}

export default DriverCreate;
