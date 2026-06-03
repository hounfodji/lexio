// Module vide : utilisé par Turbopack pour neutraliser les imports Node
// (`fs`, `path`) présents dans le glue-code WASM de Piper côté navigateur.
// Ce code n'est jamais exécuté dans le navigateur (gardé par ENVIRONMENT_IS_NODE).
const empty = {};
export default empty;
