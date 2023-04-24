import { ActivityDto } from "../dto/activity.dto";
import { CompleteActivityDto } from "../dto/request/completeActivity.dto";
import { DeleteActivityDto } from "../dto/request/deleteActivity.dto";
import { DeleteInChargeDto } from "../dto/request/deleteInCharge.dto";
import { RegisterInChargeActivityDto } from "../dto/request/registerInChargeActivity.dto";
import { UpdateActivityDTO } from "../dto/request/updateActivity.dto";
import { GetActivityDto } from "../dto/response/getActivity.dto";

export interface ActivityServiceInterface {
  createActivity(activity: ActivityDto, jwt: string): Promise<boolean>;
  deleteActivity(deleteActivity: DeleteActivityDto, jwt:string): Promise<boolean>;
  getActivity(event_id: string, activity_id: string, jwt:string): Promise<GetActivityDto>;
  registerInChargeActivity(registerInChargeActivity: RegisterInChargeActivityDto, jwt: string): Promise<boolean>;
  getEventActivities(event_id: string, jwt:string): Promise <ActivityDto[]>;
  completeActivity(activity: CompleteActivityDto, jwt: string): Promise<boolean>;
  updateActivity(updateActivity: UpdateActivityDTO, jwt: string) : Promise<boolean>;
  deleteResponsability(activity: DeleteInChargeDto, jwt: string):Promise<boolean>;
}