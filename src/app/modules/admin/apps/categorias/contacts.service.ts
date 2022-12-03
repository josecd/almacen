/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    BehaviorSubject,
    filter,
    map,
    Observable,
    of,
    switchMap,
    take,
    tap,
    throwError,
} from 'rxjs';
import {
    Contact,
    Country,
    Tag,
} from 'app/modules/admin/apps/categorias/contacts.types';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import {
    AngularFireDatabase,
    AngularFireList,
    AngularFireObject,
} from '@angular/fire/compat/database';
import * as moment from 'moment';
import { MessagesService } from '../../../../layout/common/messages/messages.service';

@Injectable({
    providedIn: 'root',
})
export class ContactsService {
    // Private
    private _contact: BehaviorSubject<Contact | null> = new BehaviorSubject(
        null
    );
    private _contacts: BehaviorSubject<Contact[] | null> = new BehaviorSubject(
        null
    );
    private _countries: BehaviorSubject<Country[] | null> = new BehaviorSubject(
        null
    );
    private _tags: BehaviorSubject<Tag[] | null> = new BehaviorSubject(null);
    private _categorias: BehaviorSubject<Tag[] | null> = new BehaviorSubject(
        null
    );
    private _articulos: BehaviorSubject<[] | null> = new BehaviorSubject(null);
    articulosRef: AngularFireList<any>;
    articuloRef: AngularFireObject<any>;

    //edit
    precio;
    nombre;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        public afs: AngularFirestore,
        private db: AngularFireDatabase,
        private _router: Router,
        private _message:MessagesService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for contact
     */
    get contact$(): Observable<Contact> {
        return this._contact.asObservable();
    }

    /**
     * Getter for contacts
     */
    get contacts$(): Observable<Contact[]> {
        return this._contacts.asObservable();
    }

    /**
     * Getter for countries
     */
    get countries$(): Observable<Country[]> {
        return this._countries.asObservable();
    }

    /**
     * Getter for tags
     */
    get tags$(): Observable<Tag[]> {
        return this._tags.asObservable();
    }

    /**
     * Getter for categoriess
     */
    get categorias$(): Observable<Tag[]> {
        return this._categorias.asObservable();
    }

    get articulos$(): Observable<Tag[]> {
        return this._articulos.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get contacts
     */
    getContacts(): Observable<Contact[]> {
        return this.afs
            .collection('categorias', ref => ref.where('status',"==",1))
            .snapshotChanges()
            .pipe(
                tap((contacts: any) => {
                    console.log(contacts);
                    let info: any;
                    info = contacts.map((e: any) => ({
                        id: e.payload.doc.id,
                        ...e.payload.doc.data(),
                    }));
                    this._contacts.next(info);
                })
            )
    }


    /**
     * Get contact by id
     */
    getContactById(id: string): Observable<Contact> {
        return this._contacts.pipe(
            take(1),
            map((contacts) => {
                // Find the contact
                const contact = contacts.find((item) => item.id === id) || null;

                // Update the contact
                this._contact.next(contact);

                // Return the contact
                return contact;
            }),
            switchMap((contact) => {
                if (!contact) {
                    return throwError(
                        'Could not found contact with id of ' + id + '!'
                    );
                }

                return of(contact);
            })
        );
    }

    /**
     * Create contact
     */
    createContact(): Observable<Contact> {
        return this.contacts$.pipe(
            take(1),
            switchMap((contacts) =>
                this._httpClient
                    .post<Contact>('api/apps/categorias/contact', {})
                    .pipe(
                        map((newContact) => {
                            // Update the contacts with the new contact
                            this._contacts.next([newContact, ...contacts]);

                            // Return the new contact
                            return newContact;
                        })
                    )
            )
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    userNul() {
        this._contact.next(null);
    }
    /**
     * Update contact
     *
     * @param id
     * @param contact
     */
    updateContact(id,contact,precio,nombre): Observable<any> {

        console.log(id);

         return this.contacts$.pipe(
            take(1),
            switchMap((contacts) => this.afs.collection('categorias').doc(id).update({
                nombre: contact.nombre,
            }).then((res: any) => {
                this._router.navigate(['/categorias']);
                // Return the deleted status
                return true;
            })

            )
        );

    }

    /**
     * Delete the contact
     *
     * @param id
     */
    deleteContact(id: string): Observable<boolean> {

        return this.contacts$.pipe(
            take(1),
            switchMap((contacts) =>
            this.afs.collection('categorias').doc(id).update({
                status:0
            }).then((res:any)=>{

                    this._router.navigate(['/categorias']);

                    // Update the contacts
                    this._contacts.next(contacts);
                    this._router.navigate(['/categorias']);

                    // Return the deleted status
                    return true;


            })

            )
        );
    }



    /**
     * Get tags
     */
    getCategories(): Observable<any> {
        return this.afs.collection('categorias').snapshotChanges();
    }

    /**
     * Get articulos
     */
    getArticulos(): Observable<any> {
        return this.afs.collection('categorias').snapshotChanges();
    }

    createArticulo(data) {
       return this.afs
            .collection('categorias')
            .add({
                nombre: data.nombre,
                fecha_entrada: moment(data.fecha_entrada).format("MM-DD-YYYY"),
                nombre_entrada: data.nombre_entrada,
                status: data.status,
                fechaentrada_time:new Date(),
            })
            .then((res) => {
                this.getArticulosObs()
                this._router.navigate(['/categorias']);
            });
        // return this._httpClient.post(environment.API_URL + '/administration/companies/create', companie);
    }

    // Create Student
    AddStudent(student) {
        this.articulosRef.push(student);
    }

    getHistorial(id) {
        return this.afs.collection('categorias').doc(id).collection('historial', ref => ref.orderBy('fechaTime', 'desc')) .snapshotChanges();
    }
        /**
   * Get contacts
   */
    getArticulosObs() {
    this.afs.collection('categorias', ref => ref.where('status',"==",1) ).snapshotChanges().subscribe(res=>{
        let info: any;
        info = res.map((e: any) => ({
            id: e.payload.doc.id,
            ...e.payload.doc.data(),
        }));
        this._contacts.next(info);

    })
    }

    sendMessage(informacion){
        let datomsm:any =[]
        informacion.map(async element => {
            let fechaCadu=new Date(element.caducidad)
            let diasAntes= new Date();
            let diasDespues= new Date();
            let diasAntes2= new Date();
            let diasDespues2= new Date();
            if (fechaCadu > this.sumarDias(diasDespues, -5) && fechaCadu < this.sumarDias(diasAntes, +5) && !element.fecha_salida) {
                if (fechaCadu < new Date()) {
                    datomsm.push({
                        id         : '22148c0c-d788-4d49-9467-447677d11b76',
                        image      : '',
                        title      : element.nombre,
                        description: 'Caduco hace unos dias',
                        time       : moment(element.caducidad).format("MM-DD-YYYY"),
                        read       : false,
                        link       : '/categorias/'+element.id,
                        useRouter  : true
                     })
                }else if(fechaCadu > new Date()){
                    datomsm.push({
                        id         : '22148c0c-d788-4d49-9467-447677d11b76',
                        image      : '',
                        title      : element.nombre,
                        description: 'Esta por caducar',
                        time       : moment(element.caducidad).format("MM-DD-YYYY"),
                        read       : false,
                        link       : '/categorias/'+element.id,
                        useRouter  : true
                     })
                }

              } else {
              }
        });
        this._message.create(datomsm)

    }

    sumarDias(fecha, dias){
        fecha.setDate(fecha.getDate() + dias);
        return fecha;
    }

}
