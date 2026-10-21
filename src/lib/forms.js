import { z } from 'zod';
import { supabase } from './supabase';
export const person = {name:z.string().trim().min(2),phone:z.string().trim().regex(/^[+\d\s()\-]{7,}$/),email:z.string().email()};
export const enquirySchema = z.object({...person,message:z.string().trim().min(10),inquiry_type:z.enum(['Request viewing','Request info','Make offer']),property_id:z.number().nullable().optional(),source:z.enum(['property-detail','homepage-cta']),website:z.string().optional()});
export const contactSchema = z.object({...person,message:z.string().trim().min(10),enquiry_type:z.string().min(2),website:z.string().optional()});
export const ownerSchema = z.object({owner_name:person.name,phone:person.phone,email:person.email,property_type:z.string().min(2),intent:z.enum(['Rent','Sell','Manage','Valuation']),city:z.string().min(2),approximate_size:z.string().min(1),address:z.string().min(3),notes:z.string().min(10),uploads:z.array(z.string()).max(6),website:z.string().optional()});
export async function submitForm(kind, data) { if(!supabase) throw Error('Supabase is not configured'); const {data:result,error}=await supabase.functions.invoke('submit-form',{body:{kind,...data}}); if(error)throw error; return result; }
