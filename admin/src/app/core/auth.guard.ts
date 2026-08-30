import {CanActivateFn,Router} from '@angular/router';
import {inject} from '@angular/core';
export const adminGuard:CanActivateFn=()=>{
 const token=localStorage.getItem('favshop_admin_token');
 const user=JSON.parse(localStorage.getItem('favshop_admin_user')||'null');
 if(token && user?.role==='admin') return true;
 return inject(Router).createUrlTree(['/login']);
};