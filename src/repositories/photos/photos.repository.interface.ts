import { FileDTO } from "../../modules/files/dto/file.dto";

export interface PhotosRepositoryInterface {
    saveFileInUser(user_id: string, profile_photo: string, small_photo: string, userCollection);
    saveFileInEvent(event_id: string, photo: string, eventCollection);
    uploadPhotosToAlbum(photos, photosCollection): Promise<boolean>;
    deletePhoto(photo_id: string, photosCollection): Promise<boolean>;
    deletePhotos(event_id: string, photosCollection): Promise<boolean>;
    getPhotos(event_id: string, photosCollection, skip, limit): Promise<any>;
    countPhotos(event_id, photosCollection): Promise<number>;
    deleteManyPhotos(photos_id, photosCollection): Promise<boolean>
}