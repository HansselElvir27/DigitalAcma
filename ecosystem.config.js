module.exports = {
  apps: [
    {
      name: 'digital-acma',
      script: './node_modules/next/dist/bin/next',
      args: 'start',
      exec_mode: 'fork', // o 'cluster' si quieres balancear carga en múltiples núcleos
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
}
