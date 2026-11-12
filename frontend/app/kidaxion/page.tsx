'use client';

/**
 * Kidaxion Web: participation scolaire dans les projets Konnaxion autorisés.
 * L'API Konnaxion filtre les projets et messages côté serveur; cette vue
 * ne donne AUCUN droit Orgo. Les tâches réelles ne sont pas simulées ici.
 */
import React, { useCallback, useEffect, useState } from 'react';
import api from '@/api';

const SCHOOL_CATEGORY = 'ekole.school';
const SUGGESTIONS = [
  'J’ai besoin d’aide pour cette activité.',
  'Peux-tu m’expliquer la consigne ?',
  'Je peux aider mon équipe.',
  'Je souhaite demander une revue à mon enseignant.',
] as const;

type Project = {id:number; title:string; category:string; description:string};
type Message = {id:number; project:number; content:string; author:string; created_at:string};
type Collection<T> = T[] | {results:T[]};
function rows<T>(data:Collection<T>):T[] { return Array.isArray(data) ? data : data.results ?? []; }

export default function KidaxionPage(): JSX.Element {
  const [projects,setProjects]=useState<Project[]>([]);
  const [project,setProject]=useState<number | null>(null);
  const [messages,setMessages]=useState<Message[]>([]);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [loading,setLoading]=useState(true);
  const selected=projects.find(item=>item.id===project);

  useEffect(()=>{
    let live=true;
    (async()=>{
      try {
        const data=await api.get<Collection<Project>>('keenkonnect/projects/',{}, {category:SCHOOL_CATEGORY});
        const allowed=rows(data).filter(x=>x.category?.toLowerCase()===SCHOOL_CATEGORY);
        if(live){setProjects(allowed);setProject(allowed[0]?.id ?? null);setNotice('');}
      } catch(e) { if(live)setNotice('Connecte-toi avec ton compte autorisé pour voir les projets de ta classe.'); }
      finally {if(live)setLoading(false);}
    })();
    return ()=>{live=false;};
  },[]);

  const refresh=useCallback(async()=>{
    if(project===null)return;
    try {
      const data=await api.get<Collection<Message>>('keenkonnect/messages/',{}, {project});
      setMessages(rows(data).filter(item=>item.project===project));
    } catch(e){setMessages([]);setNotice('Les messages ne sont pas accessibles à ton compte.');}
  },[project]);
  useEffect(()=>{void refresh();},[refresh]);

  async function postMessage(content:string){
    if(project===null || busy)return;
    setBusy(true);setNotice('');
    try {
      // One of four approved templates. The server checks school membership,
      // content and project scope. An HTTP success is a message, not a task win.
      await api.post('keenkonnect/messages/',{project,content});
      setNotice('Message transmis à ton projet. Il ne valide pas ta tâche.');
      await refresh();
    } catch(e) {setNotice('Message refusé ou connexion interrompue. Demande de l’aide à ton enseignant.');}
    finally {setBusy(false);}
  }

  return <main lang="fr-CA" style={{maxWidth:780,margin:'auto',padding:'24px 16px',fontFamily:'system-ui,sans-serif',lineHeight:1.5}}>
    <h1>Kidaxion · Mes projets</h1>
    <p>Travaille avec ton équipe. Pour les tâches et les réussites, c’est ton enseignant qui confirme.</p>
    {loading ? <p role="status">Chargement…</p> : projects.length===0 ? <p>Aucun projet de classe accessible pour ce compte.</p> : <>
      <label htmlFor="kidaxion-project">Choisis ton projet</label>
      <select id="kidaxion-project" value={project??''} onChange={e=>setProject(Number(e.target.value))}
        style={{display:'block',padding:12,width:'100%',fontSize:18,marginTop:6}}>
        {projects.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}
      </select>
      <section aria-labelledby="kidaxion-project-title" style={{marginTop:20}}>
        <h2 id="kidaxion-project-title">{selected?.title}</h2><p>{selected?.description}</p>
        <h3>Je peux communiquer</h3>
        <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
          {SUGGESTIONS.map(sentence=><button key={sentence} type="button" disabled={busy}
            onClick={()=>void postMessage(sentence)} style={{padding:'12px 14px',fontSize:16,borderRadius:12,border:'1px solid #888',cursor:'pointer',background:'#fff',color:'#111'}}>{sentence}</button>)}
        </div>
        <h3>Messages de mon équipe</h3>
        <button onClick={()=>void refresh()} type="button" style={{padding:'10px 12px'}}>Actualiser les messages</button>
        {messages.length===0 ? <p>Pas encore de messages à afficher.</p> : <ul style={{paddingLeft:24}}>
          {messages.map(item=><li key={item.id} style={{padding:'8px 0'}}>{item.content}</li>)}
        </ul>}
        <h3>Mes tâches et mon portfolio</h3>
        <p>Les tâches Orgo et les preuves Ékole seront affichées lorsque ta séance sera autorisée et reliée. Aucun résultat n’est déduit de ces messages.</p>
      </section>
    </>}
    <p aria-live="polite" role="status">{notice}</p>
  </main>;
}
