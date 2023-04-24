import { AddressDto } from "../../../event/dto/address.dto";

export class GetUserDto {
    username: string;
    name: string;
    lastname: string;
    email: string;
    birthday: string;
    gender: string;
    address: AddressDto;
    profile_photo: string;
}