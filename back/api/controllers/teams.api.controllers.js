import * as teamsServices from './../../services/teams.services.js';
import { ObjectId } from 'mongodb';
import { resolveImage } from '../../middleware/helpers.middleware.js';

export async function findAll(req, res) {
  const teams = await teamsServices.findAllTeams();
  res.status(200).json(teams);
}

export async function findById(req, res) {
  const teamId = req.params.teamId;
  const team = await teamsServices.findTeamById(teamId);
  res.status(200).json(team);
}

/* export async function create(req, res) {
  const teamData = {
    ...req.body,
  };

  const result = await teamsServices.createTeam(teamData);
  res.status(201).json(result);
} */

  export async function create(req, res, next) {
  try {
    const logoFile = req.files?.logo?.[0];
    const isologoFile = req.files?.isologo?.[0];

    const logo = resolveImage({
      file: logoFile,
      folder: "teams",
      defaultImage: "general/team_logo_default.png",
    });

    const isologo = resolveImage({
      file: isologoFile,
      folder: "teams",
      defaultImage: "general/team_isologo_default.png",
    });

    const teamData = {
      ...req.body,
      logo,
      isologo,
    };

    const result = await teamsServices.createTeam(teamData);
    const newTeam = await teamsServices.findTeamById(result.insertedId);

    res.status(201).json(newTeam);
  } catch (err) {
    next(err);
  }
}

export async function editById(req, res, next) {
  try {
    const teamId = req.params.teamId;
    const existingTeam = await teamsServices.findTeamById(teamId);

    const logoFile = req.files?.logo?.[0];
    const isologoFile = req.files?.isologo?.[0];

    const logo = resolveImage({
      file: logoFile,
      currentImage: existingTeam.logo,
      folder: "teams",
      defaultImage: "general/team_logo_default.png",
    });

    const isologo = resolveImage({
      file: isologoFile,
      currentImage: existingTeam.isologo,
      folder: "teams",
      defaultImage: "general/team_isologo_default.png",
    });

    const newData = {
      ...req.body,
      logo,
      isologo,
    };

    // drivers (lógica que ya tenías)
    if (Array.isArray(req.body.drivers)) {
      const validDriverIds = req.body.drivers.filter(
        (id) => id && ObjectId.isValid(id)
      );
      newData.drivers = validDriverIds.map((id) => new ObjectId(id));
    }

    await teamsServices.updateTeam(teamId, newData);
    const updatedTeam = await teamsServices.findTeamById(teamId);

    res.status(200).json(updatedTeam);
  } catch (err) {
    next(err);
  }
}


/* export async function editById(req, res) {
  try {
    const teamId = req.params.teamId;
    const newData = { ...req.body };

    if (Array.isArray(req.body.drivers)) {
      const validDriverIds = req.body.drivers.filter(
        (id) => id && ObjectId.isValid(id)
      );

      newData.drivers = validDriverIds.map((id) => new ObjectId(id));
    }

    const result = await teamsServices.updateTeam(teamId, newData);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error al editar equipo:", err);
    res
      .status(500)
      .json({ message: "Error al editar equipo", error: err.message });
  }
} */



export async function deleteById(req, res) {
  const teamId = req.params.teamId;
  const result = await teamsServices.deleteTeam(teamId);
  res.status(200).json(result);
}
