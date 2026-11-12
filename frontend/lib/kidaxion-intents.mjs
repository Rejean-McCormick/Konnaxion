/** Kidaxion Lite: demandes non autoritatives côté client.
 * Le serveur Konnaxion DOIT reconstruire la séance, l'identité et les accès.
 * Ce module ne fait aucune transmission ni libération d'indice.
 */
const REF = /^[a-z0-9][a-z0-9_-]{1,63}$/;
const KINDS = new Set(['ask_help','offer_clue_reference','request_task_review']);
const KEYS = new Set(['kind','task_ref','role_code','fragment_ref']);
const validRef = (value) => typeof value === 'string' && REF.test(value);
export function buildKidaxionIntent(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) throw new Error('Intent objet requis');
  for(const key of Object.keys(input)) if(!KEYS.has(key)) throw new Error('Donnée non autorisée dans une demande Kidaxion');
  const {kind,task_ref,role_code,fragment_ref} = input;
  if(!KINDS.has(kind) || !validRef(task_ref) || !validRef(role_code)) throw new Error('Action ou référence invalide');
  if(kind==='offer_clue_reference' ? !validRef(fragment_ref) : fragment_ref !== undefined)
    throw new Error('Référence de fragment absente ou superflue');
  return Object.freeze({format:'kidaxion.client-intent/0.1',mode:'proposal_only',
    kind,task_ref,role_code,...(fragment_ref === undefined ? {} : {fragment_ref}),
    server_authorized:false,dispatch_allowed:false});
}
