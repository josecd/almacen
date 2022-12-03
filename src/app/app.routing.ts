import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'articulos'},

    // Redirect signed in user to the '/example'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'articulos'},

    // // Auth routes for guests
    // {
    //     path: '',
    //     canActivate: [NoAuthGuard],
    //     canActivateChild: [NoAuthGuard],
    //     component: LayoutComponent,
    //     data: {
    //         layout: 'empty'
    //     },
    //     children: [
    //         {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule)},
    //         {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule)},
    //         {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule)},
    //         {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule)},
    //         {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule)}
    //     ]
    // },

    // // Auth routes for authenticated users
    // {
    //     path: '',
    //     canActivate: [AuthGuard],
    //     canActivateChild: [AuthGuard],
    //     component: LayoutComponent,
    //     data: {
    //         layout: 'empty'
    //     },
    //     children: [
    //         {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule)},
    //         {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule)}
    //     ]
    // },

    // Landing routes
    {
        path: '',
        component  : LayoutComponent,
        data: {
            layout: 'empty'
        },
        children   : [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)},

        ]
    },

    // Admin routes
    {
        path       : '',
        component  : LayoutComponent,
        resolve    : {
            initialData: InitialDataResolver,
        },
        children   : [
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.module').then(m => m.ExampleModule)},
             {path: 'articulos', loadChildren: () => import('app/modules/admin/apps/contacts/contacts.module').then(m => m.ContactsModule)},
             {path: 'categorias', loadChildren: () => import('app/modules/admin/apps/categorias/contacts.module').then(m => m.ContactsModule)},
             {path: 'ecommerce', loadChildren: () => import('app/modules/admin/apps/ecommerce/ecommerce.module').then(m => m.ECommerceModule)},
        ]
    },
    // Apps
    {path: 'apps', children: [
        {path: 'academy', loadChildren: () => import('app/modules/admin/apps/academy/academy.module').then(m => m.AcademyModule)},
        {path: 'chat', loadChildren: () => import('app/modules/admin/apps/chat/chat.module').then(m => m.ChatModule)},
        {path: 'contacts', loadChildren: () => import('app/modules/admin/apps/contacts/contacts.module').then(m => m.ContactsModule)},
        {path: 'ecommerce', loadChildren: () => import('app/modules/admin/apps/ecommerce/ecommerce.module').then(m => m.ECommerceModule)},
        {path: 'file-manager', loadChildren: () => import('app/modules/admin/apps/file-manager/file-manager.module').then(m => m.FileManagerModule)},
        {path: 'help-center', loadChildren: () => import('app/modules/admin/apps/help-center/help-center.module').then(m => m.HelpCenterModule)},
        {path: 'mailbox', loadChildren: () => import('app/modules/admin/apps/mailbox/mailbox.module').then(m => m.MailboxModule)},
        {path: 'notes', loadChildren: () => import('app/modules/admin/apps/notes/notes.module').then(m => m.NotesModule)},
        {path: 'scrumboard', loadChildren: () => import('app/modules/admin/apps/scrumboard/scrumboard.module').then(m => m.ScrumboardModule)},
        {path: 'tasks', loadChildren: () => import('app/modules/admin/apps/tasks/tasks.module').then(m => m.TasksModule)},
    ]},

    // 404 & Catch all
    {path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/error/error-404/error-404.module').then(m => m.Error404Module)},
    {path: '**', redirectTo: '404-not-found'}
];
