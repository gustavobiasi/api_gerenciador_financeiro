module.exports = {
    test: {
        client: 'pg',
        version: '9.6',
        connection: {
            host: 'localhost',
            user: 'postgres',
            password: 'pgsq1@Rez',
            database: 'barriga',
        },
        migrations: { directory: 'src/migrations' },
        seeds: { directory: 'src/seeds'},
    },
};