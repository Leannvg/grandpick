import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DriversServices from "../../../services/drivers.services.js";
import DriverForm from "./../../../components/dashboardForms/DriverForm.jsx";
import * as helpers from "../../../utils/helpers.js";
import { useRedirectToTab } from "../../../hooks/useRedirectToTab.js";
import { useAlert } from "../../../context/AlertContext.jsx";
import { useDialog } from "../../../context/DialogContext.jsx";

function DriverEdit() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState({});
  const [errorsForm, setErrors] = useState({});
  const redirectToTab = useRedirectToTab();
  const { showAlert } = useAlert();
  const { confirmDialog } = useDialog();

  useEffect(() => {
    async function fetchDriver() {
      const driver = await DriversServices.findDriverById(id);
      setInitialData(driver);
    }
    fetchDriver();
  }, [id]);


  async function handleEdit(driverData, imageFile) {
    try {
      const dialog = {
        title: `¿Deseas editar el piloto ${driverData.full_name}?`,
        message: "Se actualizarán los cambios realizados.",
        confirmText: "Editar",
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

      await DriversServices.editDriver(id, formData);

      showAlert(
        `Piloto ${driverData.full_name} editado con éxito`,
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
      <h2>Editar Piloto</h2>
      {initialData.full_name ? (
        <DriverForm
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
  );
}

export default DriverEdit;
