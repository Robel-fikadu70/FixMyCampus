import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const isAbsoluteUrl = req.url.startsWith('http://') || req.url.startsWith('https://');
  const apiReq = req.clone({
    url: isAbsoluteUrl ? req.url : `${environment.apiUrl}${req.url}`,
    withCredentials: true
  });
  return next(apiReq);
};