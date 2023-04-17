import { Tracks } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const create = async (
    _id,
    trackName,
    trackURL,
    artistName,
    artistURL,
    albumName,
    albumURL
) => {
    let topsongs = {
    trackname: trackName,
    trackURL : trackURL,
    artistName: artistName,
    artistURL : artistURL,
    albumName : albumName,
    albumURL : albumURL
    }
const TrackCollection = await Tracks();
const insertInfo = await TrackCollection.insertOne(topsongs);
const trackId = insertInfo.insertedId.toString();
const Track = await get(trackId);
return Track;
}

const getAll = async () => {
    const TrackCollection = await bands();
    let TrackList = await TrackCollection.find({}).toArray();
    if(!TrackList) throw 'Could not get all Tracks';
    TrackList = TrackList.map((Track) => {
        Track._id = Track._id.toString();
        return Track;
    })
    return TrackList;
}

const get = async (id) => {
    id = id.trim();
    const TrackCollection = await Tracks();
    const Track = await TrackCollection.findOne({ _id: ObjectId(id) });
    Track._id = Track._id.toString();
    return Track;   
}

export {create, getAll, get}
