 import userRoutes from './users.js';
// import songRoutes from './songs.js';
// import artistRoutes from './artistRoutes.js';
// import commentRoutes from './comments.js';

const constructorMethod = (app) => {
    app.get('/', (req, res) => {
        // Landing page
        res.send("Hello User");
    });
    app.use('/users', userRoutes);
    // app.use('/songs', songRoutes);
    // app.use('/artists', artistRoutes);
    // app.use('/comments', commentRoutes);

    app.use('*', (req, res) => {
        res.status(404).json({error: 'Route not found'});
    });
};

export default constructorMethod;