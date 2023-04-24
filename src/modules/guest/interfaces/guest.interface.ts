import { GuestDto } from '../dto/guest.dto';
import { DeleteGuestDto } from '../dto/request/deleteGuest.dto';
import { registerGuestsDto } from '../dto/request/registerGuest.dto';
import { RespondInvitationDTO } from '../dto/request/respondInvitation.dto';
import { registerGuestResponseDto } from '../dto/response/registerGuestResponse.dto';

export interface GuestServiceInterface {
  registerGuest(guest: registerGuestsDto, jwt: string): Promise<boolean>;
  deleteGuest(deleteGuest: DeleteGuestDto, jwt: string): Promise<boolean>;
  getGuests(event_id: string): Promise<GuestDto[]>;
  respondInvitation(respondInvitation: RespondInvitationDTO, jwt:string);
}
