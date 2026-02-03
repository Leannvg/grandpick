import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TeamsServices from "./../../../services/teams.services.js";
import TeamForm from "./../../../components/dashboardForms/TeamForm.jsx";
import * as helpers from "./../../../utils/helpers.js";
import { useRedirectToTab } from "../../../hooks/useRedirectToTab.js";
import { useAlert } from "../../../context/AlertContext.jsx";
import { useDialog } from "../../../context/DialogContext.jsx";

function TeamEdit() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState({});
  const [errorsForm, setErrors] = useState({});
  const redirectToTab = useRedirectToTab();
  const { showAlert } = useAlert();
  const { confirmDialog } = useDialog();

  useEffect(() => {
    TeamsServices.findTeamById(id).then(setInitialData);
  }, [id]);

  async function handleEdit(teamData, logoFile, isologoFile) {
    try {
      const dialog = {
        title: `¿Deseas editar la escudería ${teamData.name}?`,
        message: "Se actualizarán los cambios realizados.",
        confirmText: "Editar",
        cancelText: "Cancelar",
        confirmVariant: "success",
      };

      const confirmed = await confirmDialog(dialog);
      if (!confirmed) return;

      const formData = new FormData();

      Object.entries(teamData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      if (isologoFile) {
        formData.append("isologo", isologoFile);
      }

      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      await TeamsServices.editTeam(id, formData);

      redirectToTab("Escuderias");
      showAlert(`Escudería ${teamData.name} actualizada con éxito ✅`, "success");
    } catch (error) {
      console.log(error);
      if (!error) return;
      const parsedErrors = helpers.parseErrorMessage(error);
      setErrors(parsedErrors);
      showAlert("Ups! parece que hay campos incompletos.", "danger", true);
    }
  }


  return (
    <div className="container mt-4">
      <h2>Editar Escudería</h2>
      {initialData.name ? (
        <TeamForm
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

export default TeamEdit;
