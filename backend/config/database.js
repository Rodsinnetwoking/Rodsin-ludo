module.exports = function (mongoose) {
    mongoose.set('useFindAndModify', false);

    const uri = process.env.CONNECTION_URI;

    console.log('--- MongoDB diagnostic ---');
    console.log('CONNECTION_URI exists:', !!uri);
    console.log('Starts with mongodb+srv://:', uri?.startsWith('mongodb+srv://'));
    console.log('Starts with CONNECTION_URI=:', uri?.startsWith('CONNECTION_URI='));
    console.log('URI length:', uri ? uri.length : 0);

    mongoose
        .connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'test',
        })
        .then(() => {
            console.log('MongoDB Connected…');
        })
        .catch(err => console.error('MongoDB error:', err));
};
