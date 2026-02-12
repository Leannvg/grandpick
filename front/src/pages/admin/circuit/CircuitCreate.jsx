import { useState } from "react";
import CircuitsServices from "./../../../services/circuits.services.js";
import CircuitForm from "./../../../components/dashboardForms/CircuitForm.jsx";
import * as helpers from "./../../../utils/helpers.js";
import { useRedirectToTab } from "../../../hooks/useRedirectToTab.js";
import { useAlert } from "../../../context/AlertContext.jsx";
import { useDialog } from "../../../context/DialogContext.jsx";

function CircuitCreate() {
  const [errorsForm, setErrors] = useState({});
  const redirectToTab = useRedirectToTab();
  const { showAlert } = useAlert();
  const { confirmDialog } = useDialog();


  async function handleCreate(circuitData, imageFile) {
    try {
      const dialog = {
        title: "¿Deseas crear un nuevo circuito?",
        message: "Se creará un nuevo circuito con los datos ingresados.",
        confirmText: "Crear",
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

      await CircuitsServices.create(formData);

      showAlert("Circuito creado con éxito ✅", "success");
      redirectToTab("Circuitos");
    } catch (error) {
      if(!error) return
      console.log(error)
      const parsedErrors = helpers.parseErrorMessage(error);
      setErrors(parsedErrors);
      showAlert("Ups! parece que hay campos incompletos.", "danger", true);
    }
  }

  return (
    <div className="container admin">
      <h1>Nuevo Circuito</h1>
      <CircuitForm onSubmit={handleCreate} submitLabel="Crear" errorsForm={errorsForm} />
    </div>
  );
}

export default CircuitCreate;
