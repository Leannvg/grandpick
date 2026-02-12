import { useState } from "react";
import TeamsServices from "./../../../services/teams.services.js";
import TeamForm from "./../../../components/dashboardForms/TeamForm.jsx";
import * as helpers from "./../../../utils/helpers.js";
import { useRedirectToTab } from "../../../hooks/useRedirectToTab.js";
import { useAlert } from "../../../context/AlertContext.jsx";
import { useDialog } from "../../../context/DialogContext.jsx";

function TeamCreate() {
  const [errorsForm, setErrors] = useState({});
  const redirectToTab = useRedirectToTab();
  const { showAlert } = useAlert();
  const { confirmDialog } = useDialog();

  async function handleCreate(teamData, logoFile, isologoFile) {
    try {
      const dialog = {
        title: `¿Deseas crear la escudería ${teamData.name}?`,
        message: "Se creará una nueva escudería con los datos ingresados.",
        confirmText: "Crear",
        cancelText: "Cancelar",
        confirmVariant: "success",
      };

      const confirmed = await confirmDialog(dialog);
      if (!confirmed) return;

      const formData = new FormData();

      // datos normales
      Object.entries(teamData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // archivos
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (isologoFile) {
        formData.append("isologo", isologoFile);
      }

      await TeamsServices.createTeam(formData);

      redirectToTab("Escuderias");
      showAlert(`Escudería ${teamData.name} creada con éxito ✅`, "success");
    } catch (error) {
      if (!error) return;
      const parsedErrors = helpers.parseErrorMessage(error);
      setErrors(parsedErrors);
      showAlert("Ups! parece que hay campos incompletos.", "danger", true);
    }
  }


  return (
    <div className="container mt-4">
      <h2>Crear Nueva Escudería</h2>
      <TeamForm onSubmit={handleCreate} submitLabel="Crear" errorsForm={errorsForm} />
    </div>
  );
}

export default TeamCreate;
