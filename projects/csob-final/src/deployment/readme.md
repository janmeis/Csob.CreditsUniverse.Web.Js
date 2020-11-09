config.js

 * slouží ke konfiguraci klienta
 * je možné měnit i po zkompilování (ng build)
 * defaultní hodnoty zapisujte do app.config.ts (POZOR, tyto hodnoty se použíjí na PROD, pokud nebudou přepsány)
 *   při spuštění aplikace se provede merge s config.js (ten vyhrává)
 * pro použití z aplikace nadeklarujte novou property v app-config.ts interface DeploymentConfig
