import { Binary } from "mongodb";

export class FileDTO{
    event_id: string;
    _id: string;
    mimetype: string;
    originalname: string;
    buffer: Binary;
}