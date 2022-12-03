import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { ContactsService } from 'app/modules/admin/apps/categorias/contacts.service';
import { Contact, Country, Tag } from 'app/modules/admin/apps/categorias/contacts.types';

@Injectable({
    providedIn: 'root'
})
export class ContactsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _contactsService: ContactsService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Contact[]>
    {
        return this._contactsService.getContacts();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ContactsContactResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _contactsService: ContactsService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Contact>
    {
        if (route.paramMap.get('id') === '0') {
            this._contactsService.userNul();
            // const parentUrl = state.url.split('/').slice(0, -1).join('/');
            // this._router.navigateByUrl(state.url);
          }else{
            return this._contactsService.getContactById(route.paramMap.get('id')).pipe(
              // Error here means the requested contact is not available
              catchError((error) => {
                // Log the error
                console.error(error);
                // Get the parent url
                const parentUrl = state.url.split('/').slice(0, -1).join('/');
                console.log(parentUrl);
                // Navigate to there
                console.log(parentUrl);
                this._router.navigateByUrl(parentUrl);
                // Throw an error
                return throwError(error);
              })
            );
          }
    }
}



@Injectable({
    providedIn: 'root'
})
export class ContactsCategoriesResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _contactsService: ContactsService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Tag[]>
    {
        return this._contactsService.getCategories();
    }
}

@Injectable({
    providedIn: 'root'
})
export class ContactsArticulosResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _contactsService: ContactsService)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<[]>
    {
        return this._contactsService.getCategories();
    }
}



