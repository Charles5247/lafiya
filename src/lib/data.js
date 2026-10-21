import { useEffect, useState } from 'react';
import { supabase } from './supabase';
export function useRows(table, query) {
  const [state,setState]=useState({data:[],loading:true,error:null});
  useEffect(()=>{ let alive=true; if(!supabase){setState({data:[],loading:false,error:null});return;}
    let q=supabase.from(table).select('*'); if(query) q=query(q);
    q.then(({data,error})=>{if(alive)setState({data:data||[],loading:false,error});});
    return ()=>{alive=false};
  },[table,query]); return state;
}
export function useOne(table) { const {data,...rest}=useRows(table); return {data:data[0]||null,...rest}; }
export async function getRows(table, query) { if(!supabase)return []; let q=supabase.from(table).select('*'); if(query)q=query(q); const {data,error}=await q; if(error)throw error; return data||[]; }
export const money = n => '₦'+Number(n||0).toLocaleString('en-NG');
export function track(event, props={}) { if(typeof window!=='undefined' && localStorage.getItem('analytics-consent')==='yes' && window.gtag) window.gtag('event',event,props); }
