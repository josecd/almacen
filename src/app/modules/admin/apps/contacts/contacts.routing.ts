import { Route } from '@angular/router';
import { CanDeactivateContactsDetails } from 'app/modules/admin/apps/contacts/contacts.guards';
import {
    ContactsContactResolver,
    ContactsCountriesResolver,
    ContactsResolver,
    ContactsCategoriesResolver,
} from 'app/modules/admin/apps/contacts/contacts.resolvers';
import { ContactsComponent } from 'app/modules/admin/apps/contacts/contacts.component';
import { ContactsListComponent } from 'app/modules/admin/apps/contacts/list/list.component';
import { ContactsDetailsComponent } from 'app/modules/admin/apps/contacts/details/details.component';

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
                    countries: ContactsCountriesResolver,
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
