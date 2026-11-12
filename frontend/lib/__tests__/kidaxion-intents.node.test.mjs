import test from 'node:test';
import assert from 'node:assert/strict';
import {buildKidaxionIntent} from '../kidaxion-intents.mjs';

test('demande d aide neutre, non autoritative',()=>{
 const value=buildKidaxionIntent({kind:'ask_help',task_ref:'invitation',role_code:'sorciere'});
 assert.equal(value.server_authorized,false);
 assert.equal(value.dispatch_allowed,false);
 assert.equal(value.mode,'proposal_only');
 assert.equal(JSON.stringify(value).includes('child'),false);
});
test('partage de la référence uniquement, jamais du contenu',()=>{
 const value=buildKidaxionIntent({kind:'offer_clue_reference',task_ref:'echange-indices',role_code:'messager',fragment_ref:'papier-disponible'});
 assert.equal(value.fragment_ref,'papier-disponible');
 assert.throws(()=>buildKidaxionIntent({kind:'offer_clue_reference',task_ref:'echange-indices',role_code:'messager',fragment_ref:'papier-disponible',clue_text:'secret'}));
});
test('interdit les permissions forgées, noms, messages libres, identité ou world arbitraire',()=>{
 for(const extra of [{teacher_authorized:true},{student_name:'Julie'},{message:'xxx'},{world_id:'not-trusted'},{dispatch_allowed:true}]){
   assert.throws(()=>buildKidaxionIntent({kind:'request_task_review',task_ref:'origami',role_code:'origamiste',...extra}));
 }
});
test('refs, mode et types invalides rejetés',()=>{
 for(const input of [null,{}, {kind:'finish_task',task_ref:'origami',role_code:'origamiste'},
  {kind:'ask_help',task_ref:'../secret',role_code:'origamiste'},
  {kind:'ask_help',task_ref:{toString:()=> 'origami'},role_code:'origamiste'},
  {kind:'offer_clue_reference',task_ref:'origami',role_code:'origamiste'},
  {kind:'ask_help',task_ref:'origami',role_code:'origamiste',fragment_ref:'papier-disponible'}]){
  assert.throws(()=>buildKidaxionIntent(input));
 }
});
