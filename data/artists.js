// import { Artists } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const create = async (
    _id,
    artistName,
    artistURL
) => {
    let topartists = {
    artistName: artistName,
    artistURL : artistURL
    }
const ArtistCollection = await Artists();
const insertInfo = await ArtistCollection.insertOne(topartists);
const artistId = insertInfo.insertedId.toString();
const Artist = await get(artistId);
return Artist;
}

const getAll = async () => {
    const ArtistCollection = await Artists();
    let artistList = await ArtistCollection.find({}).toArray();
    if(!artistList) throw 'Could not get all Artists';
    artistList = artistList.map((Artist) => {
        Artist._id = Artist._id.toString();
        return Artist;
    })
    return artistList;
}

const get = async (id) => {
    id = id.trim();
    const artistCollection = await Artists();
    const Artist = await artistCollection.findOne({ _id: ObjectId(id) });
    Artist._id = Artist._id.toString();
    return Artist;   
}

export {create, getAll, get}
