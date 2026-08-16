module.exports = function (mongoose) {
    mongoose.set('useFindAndModify', false);

    const uri = process.env.CONNECTION_URI || '';

    console.log('--- MongoDB URI diagnostic ---');
    console.log('Exists:', !!uri);
    console.log('Length:', uri.length);
    console.log('Starts mongodb+srv://:', uri.startsWith('mongodb+srv://'));
    console.log('Contains @:', uri.includes('@'));
    console.log('Contains colon after protocol:', uri.includes(':'));
    console.log('Contains mongodb.net:', uri.includes('mongodb.net'));
    console.log('Contains whitespace:', /\s/.test(uri));
    console.log('Contains < or >:', /[<>]/.test(uri));
    console.log('Contains quotes:', /["']/.test(uri));

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
