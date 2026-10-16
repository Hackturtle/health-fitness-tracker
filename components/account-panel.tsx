"use client";
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

export function AccountPanel({user,open,onClose,children}:{user:User|null;open:boolean;onClose:()=>void;children?:ReactNode}){
 const [mode,setMode]=useState<'signin'|'signup'|'reset'|'password'>('signin');
 const [recovery,setRecovery]=useState(false);
 const [busy,setBusy]=useState(false);
 const [feedback,setFeedback]=useState('');
 useEffect(()=>{const {data:{subscription}}=supabase.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY'){setMode('password');setRecovery(true);}});return ()=>subscription.unsubscribe();},[]);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;setBusy(true);setFeedback('');
  const data=new FormData(e.currentTarget);const email=String(data.get('email')??'').trim();const password=String(data.get('password')??'');
  try{
   const redirect=window.location.origin+'/';
   const result=mode==='signin'?await supabase.auth.signInWithPassword({email,password}):mode==='signup'?await supabase.auth.signUp({email,password,options:{emailRedirectTo:redirect}}):mode==='reset'?await supabase.auth.resetPasswordForEmail(email,{redirectTo:redirect}):await supabase.auth.updateUser({password});
   if(result.error)throw result.error;
   if(mode==='reset')setFeedback('If that account exists, a password reset link will arrive by email.');
   else if(mode==='signup'&&!('data' in result&&result.data&&'session' in result.data&&result.data.session))setFeedback('Check your email to confirm your account, then return here to sign in.');
   else {setRecovery(false);onClose();setMode('signin');}
  }catch(e){setFeedback(e instanceof Error?e.message:'Could not complete that request. Please retry.');}finally{setBusy(false);}
 }
 return <Dialog open={open||recovery} onOpenChange={v=>{if(!v&&!busy){setRecovery(false);onClose();setFeedback('');}}}><DialogContent className="detail-dialog"><DialogTitle className="detail-title">{user&&mode!=='password'?'Your account':mode==='signup'?'Create your account':mode==='reset'?'Reset password':mode==='password'?'Choose a new password':'Your personal logbook'}</DialogTitle><DialogDescription>Save workouts, sleep, body progress, templates and custom exercises to your private account.</DialogDescription>{user&&mode!=='password'?<div className="entry-form"><p>{user.email}</p><p>Your workouts, sleep and body progress are saved online. Nutrition is coming next.</p>{children}<button className="secondary" disabled={busy} onClick={async()=>{setBusy(true);const {error}=await supabase.auth.signOut({scope:'local'});setBusy(false);if(error)setFeedback(error.message);else onClose();}}>Sign out on this device</button></div>:<form className="entry-form" onSubmit={submit}>{mode!=='password'&&<label>Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>}{mode!=='reset'&&<label>Password<input name="password" type="password" autoComplete={mode==='signin'?'current-password':'new-password'} required minLength={mode==='signin'?1:8} maxLength={128}/></label>}<button className="primary" disabled={busy} type="submit">{busy?'Please wait…':mode==='signup'?'Create account':mode==='reset'?'Send reset link':mode==='password'?'Update password':'Sign in'}</button>{mode!=='password'&&<div className="account-links"><button type="button" className="text-button" onClick={()=>{setMode(mode==='signin'?'signup':'signin');setFeedback('');}}>{mode==='signin'?'Create an account':'Back to sign in'}</button>{mode==='signin'&&<button type="button" className="text-button" onClick={()=>{setMode('reset');setFeedback('');}}>Forgot password?</button>}</div>}</form>}{feedback&&<p role="status" className="workout-meta">{feedback}</p>}</DialogContent></Dialog>;
}
