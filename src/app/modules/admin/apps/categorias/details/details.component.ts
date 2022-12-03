/* eslint-disable */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, LOCALE_ID, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Contact, Country, Tag } from 'app/modules/admin/apps/categorias/contacts.types';
import { ContactsListComponent } from 'app/modules/admin/apps/categorias/list/list.component';
import { ContactsService } from 'app/modules/admin/apps/categorias/contacts.service';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { registerLocaleData } from '@angular/common';
    // importar locales
    import localePy from '@angular/common/locales/es-PY';
    import localePt from '@angular/common/locales/pt';
    import localeEn from '@angular/common/locales/en';
    import localeEsAr from '@angular/common/locales/es-AR';

    // registrar los locales con el nombre que quieras utilizar a la hora de proveer
    registerLocaleData(localePy, 'es');
    registerLocaleData(localePt, 'pt');
    registerLocaleData(localeEn, 'en')
    registerLocaleData(localeEsAr, 'es-Ar');

@Component({
    selector       : 'contacts-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DatePipe,{ provide: LOCALE_ID, useValue: 'es-Ar' }]
})
export class ContactsDetailsComponent implements OnInit, OnDestroy
{
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;
    newUser: boolean =false;
    editMode: boolean = false;
    tags: Tag[];
    tagsEditMode: boolean = false;
    filteredTags: Tag[];
    contact: Contact;
    contactForm: UntypedFormGroup;
    contacts: Contact[];
    countries: Country[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    Form: UntypedFormGroup;
    FormUpdate: UntypedFormGroup;
    categorias: [];
    historial:[]

    //editar

    precio;
    nombreArticulo;
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsListComponent: ContactsListComponent,
        private _contactsService: ContactsService,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private datePipe: DatePipe
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Open the drawer
        this._contactsListComponent.matDrawer.open();

        this.Form = new UntypedFormGroup({
            nombre: new UntypedFormControl('',[Validators.required]),
            fecha_entrada:new UntypedFormControl(new Date()),
            nombre_entrada:new UntypedFormControl('default',),
            status:new UntypedFormControl(1,),
          })


          this.FormUpdate = this._formBuilder.group({
            nombre: new UntypedFormControl('',[Validators.required]),
          })



        // Get the contacts
        this._contactsService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: Contact[]) => {
                this.contacts = contacts;
                this._contactsService.sendMessage(contacts)

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the contact
        this._contactsService.contact$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contact: any) => {
                this.newUser = false;

                if (!contact) {
                  this.newUser = true;
                  this.contact  = null;
                }else{
                this.historial = []
                // Open the drawer in case it is closed
                this._contactsListComponent.matDrawer.open();
                // contact.caducidad = moment(contact.caducidad ).format("DD-MM-YYYY")
                this.contact = contact;
                // Toggle the edit mode off
                this.toggleEditMode(false);

                this.precio=  contact.precio
                this.nombreArticulo = contact.nombre
                this.FormUpdate.patchValue(contact);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
            });

        // Categorias
        this._contactsService.getCategories().subscribe((catego: []) => {
            let info : any
            info = catego.map((e: any) => ({
                idFire: e.payload.doc.id,
                ...(e.payload.doc.data()),
              }));
            this.categorias = info;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlays if they are still on the DOM
        if ( this._tagsPanelOverlayRef )
        {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._contactsListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void
    {
        if ( editMode === null )
        {
            this.editMode = !this.editMode;
        }
        else
        {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Update the contact
     */
    updateContact(): void
    {
        // Get the contact object
        const contact = this.FormUpdate.getRawValue();
        // Update the contact on the server
        this._contactsService.updateContact(this.contact.id, contact,this.precio,this.nombreArticulo).subscribe(() => {
            // Toggle the edit mode off
            this.toggleEditMode(false);
        });
    }

    /**
     * Delete the contact
     */
    deleteContact(): void
    {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : '¿Desea eliminar la categoría?',
            message: '¡Esta acción no se puede deshacer!',
            actions: {
                confirm: {
                    label: 'Eliminar'
                },
                cancel:{
                    label: 'Cancelar'

                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {
                // Get the current contact's id
                const id = this.contact.id;

                // Get the next/previous contact's id
                const currentContactIndex = this.contacts.findIndex(item => item.id === id);
                const nextContactIndex = currentContactIndex + ((currentContactIndex === (this.contacts.length - 1)) ? -1 : 1);
                const nextContactId = (this.contacts.length === 1 && this.contacts[0].id === id) ? null : this.contacts[nextContactIndex].id;

                // Delete the contact
                this._contactsService.deleteContact(id)
                    .subscribe((isDeleted) => {

                        // Return if the contact wasn't deleted...
                        if ( !isDeleted )
                        {
                            return;
                        }

                        // Navigate to the next contact if available
                        if ( nextContactId )
                        {
                            this._router.navigate(['../', nextContactId], {relativeTo: this._activatedRoute});
                        }
                        // Otherwise, navigate to the parent
                        else
                        {
                            this._router.navigate(['../'], {relativeTo: this._activatedRoute});
                        }

                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

    }


    /**
     * Open tags panel
     */
    openTagsPanel(): void
    {
        // Create the overlay
        this._tagsPanelOverlayRef = this._overlay.create({
            backdropClass   : '',
            hasBackdrop     : true,
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                                  .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
                                  .withFlexibleDimensions(true)
                                  .withViewportMargin(64)
                                  .withLockedPosition(true)
                                  .withPositions([
                                      {
                                          originX : 'start',
                                          originY : 'bottom',
                                          overlayX: 'start',
                                          overlayY: 'top'
                                      }
                                  ])
        });

        // Subscribe to the attachments observable
        this._tagsPanelOverlayRef.attachments().subscribe(() => {

            // Add a class to the origin
            this._renderer2.addClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // Focus to the search input once the overlay has been attached
            this._tagsPanelOverlayRef.overlayElement.querySelector('input').focus();
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(this._tagsPanel, this._viewContainerRef);

        // Attach the portal to the overlay
        this._tagsPanelOverlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._tagsPanelOverlayRef.backdropClick().subscribe(() => {

            // Remove the class from the origin
            this._renderer2.removeClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // If overlay exists and attached...
            if ( this._tagsPanelOverlayRef && this._tagsPanelOverlayRef.hasAttached() )
            {
                // Detach it
                this._tagsPanelOverlayRef.detach();

                // Reset the tag filter
                this.filteredTags = this.tags;

                // Toggle the edit mode off
                this.tagsEditMode = false;
            }

            // If template portal exists and attached...
            if ( templatePortal && templatePortal.isAttached )
            {
                // Detach it
                templatePortal.detach();
            }
        });
    }

    /**
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void
    {
        this.tagsEditMode = !this.tagsEditMode;
    }

    /**
     * Filter tags
     *
     * @param event
     */
    filterTags(event): void
    {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredTags = this.tags.filter(tag => tag.title.toLowerCase().includes(value));
    }


    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    saveRegister(){

        // return;
          // Do nothing if the form is invalid
          if ( this.Form.invalid )
          {
              return;
          }

          // Disable the form
          this.Form.disable();

          // Sign up
          console.log(this.Form.value);

          this._contactsService.createArticulo(this.Form.value)
          this._router.navigate(['/categorias']);

    }



    // fechas

        /**
     * Returns whether the given dates are different days
     *
     * @param current
     * @param compare
     */
         isSameDay(current: string, compare: string): boolean
         {
             return moment(current, moment.ISO_8601).isSame(moment(compare, moment.ISO_8601), 'day');
         }

         /**
          * Get the relative format of the given date
          *
          * @param date
          */
         getRelativeFormat(date: string): string
         {
             const today = moment().startOf('day');
             const yesterday = moment().subtract(1, 'day').startOf('day');

             // Is today?
             if ( moment(date, moment.ISO_8601).isSame(today, 'day') )
             {
                 return 'Today';
             }

             // Is yesterday?
             if ( moment(date, moment.ISO_8601).isSame(yesterday, 'day') )
             {
                 return 'Yesterday';
             }

             return moment(date, moment.ISO_8601).fromNow();
         }

}
