const app = require('./app');
const port = 3001;

app.listen(3001, () => {
    console.log(`Servidor iniciado na porta ${port}`);
});

