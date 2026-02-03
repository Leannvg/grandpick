import * as pointsServices from './../../services/points.services.js'

export async function findAll(req, res){
    let points = await pointsServices.findAllPoints()
    res.status(200).json(points)
}
