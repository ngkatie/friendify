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

export async function userExists(req, res, next){
    let userExists = false;
    const id = req.params.id;
    const userId = req.session.user.id;
    const users = await userData.getAll();
    users.forEach(user => {
        if (user._id === id) {
          userExists = true;
        }
      });
    if(!userExists){
        return res.status(404).render('pages/error', {title: 'Error', error: 'User not found'});
    } else if(req.params.id === userId){
        return res.redirect('/users/dashboard');
    } else {
        next()
    }
}