import * as userData from './data//users.js';

export async function noCookie(req, res, next){
    if(!req.session.user){
        return res.redirect('/')
    } else {
        next();
    }
}

export async function hasCookie(req, res, next){
    if(req.session.user){
        return res.redirect('/users/dashboard')
    } else {
        next();
    }
}

export async function notFriend(req, res, next){
    const user = await userData.get(req.session.user.id);
    const friend = await userData.get(req.params.id);

    if(!user.friends.includes(friend._id)){
        return res.redirect('/users/dashboard')
    } else {
        next();
    }
}