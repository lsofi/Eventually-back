import { ConectionPhotosRepositoryInterface } from "./conection-photos.repository.interface";

const { MongoClient } = require('mongodb');
require('dotenv').config();
export class ConectionPhotosRepository implements ConectionPhotosRepositoryInterface{
    constructor(){
        this.instanceOfDb = null;
    }

    private instanceOfDb;

    async conectionToDb() { // aplicado el patrón singleton para la conexión a BD
        try {
            if (this.instanceOfDb === null) {
                console.log("Creando base de datos...")
                const url = process.env.AZURE_STORAGE_CONNECTION_STRING_PHOTO;
                const client = new MongoClient(url);
                this.instanceOfDb = client.db(process.env.AZURE_COSMOS_DB_NAME_PHOTO);
                console.log("Base de datos creada.")
            }
            return this.instanceOfDb;
        } 
        catch (error) {
            throw new Error(`Error al conectar la base de datos ${error}`,)
        }
    }
}



