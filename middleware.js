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