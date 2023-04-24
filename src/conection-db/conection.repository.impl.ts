import { Injectable, Scope } from "@nestjs/common";
import { ConectionRepositoryInterface } from "./conection.repository,interface";

const { MongoClient } = require('mongodb');
require('dotenv').config();

@Injectable({ scope: Scope.DEFAULT })
export class ConectionRepository implements ConectionRepositoryInterface{
    constructor(){
        this.instanceOfDb = null;
    }

    private instanceOfDb;

    async conectionToDb() { // aplicado el patrón singleton para la conexión a BD
        try {
            if (this.instanceOfDb === null) {
                console.log("Creando base de datos...")
                const url = process.env.AZURE_STORAGE_CONNECTION_STRING;
                const client = new MongoClient(url);
                this.instanceOfDb = client.db(process.env.AZURE_COSMOS_DB_NAME);
                console.log("Base de datos creada.")
            }
            return this.instanceOfDb;
        } 
        catch (error) {
            throw new Error(`Error al conectar la base de datos ${error}`,)
        }
    }
}



