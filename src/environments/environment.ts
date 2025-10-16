export const environment = {
    //production: false,
    apiUrl: 'http://localhost:8080',
    // Usar la URL real de local según backend (WebFlux sin context-path /v1 aplicado)
    // Paramétricos locales expuestos en /api/parametric
    parametricBaseUrl: 'http://localhost:8080/api/parametric',
    // Fallback solo si no se define parametricBaseUrl
    parametricPath: '/api/parametric'

};
