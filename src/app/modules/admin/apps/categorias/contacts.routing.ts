import { Route } from '@angular/router';
import { CanDeactivateContactsDetails } from 'app/modules/admin/apps/categorias/contacts.guards';
import {
    ContactsContactResolver,
    ContactsResolver,
    ContactsCategoriesResolver,
} from 'app/modules/admin/apps/categorias/contacts.resolvers';
import { ContactsComponent } from 'app/modules/admin/apps/categorias/contacts.component';
import { ContactsListComponent } from 'app/modules/admin/apps/categorias/list/list.component';
import { ContactsDetailsComponent } from 'app/modules/admin/apps/categorias/details/details.component';

export const contactsRoutes: Route[] = [
    {
        path: '',
        component: ContactsComponent,
        resolve: {
        },
        children: [
            {
                path: '',
                component: ContactsListComponent,
                resolve: {
                    contacts: ContactsResolver,
                },
                children: [
                    {
                        path: ':id',
                        component: ContactsDetailsComponent,
                        resolve: {
                            contact: ContactsContactResolver,
                            categories: ContactsCategoriesResolver,
                        },
                        canDeactivate: [CanDeactivateContactsDetails],
                    },
                ],
            },
        ],
    },
];
