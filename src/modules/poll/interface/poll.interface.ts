import { PollDto } from "../dto/poll.dto";
import { DeletePollDto } from "../dto/request/deletePoll.dto";
import { RespondPollDto } from "../dto/request/respondPoll.dto";

export interface PollServiceInterface {
    createPoll(poll: PollDto, jwt: string): Promise<boolean>;
    deletePoll(deletePoll: DeletePollDto, jwt: string): Promise<boolean>;
    updatePoll(updatePoll: PollDto, jwt: string) : Promise<boolean>;
    getPoll(event_id: string, poll_id: string, jwt: string): Promise<PollDto>;
    getEventPolls(event_id: string, jwt:string): Promise<PollDto[]>;
    respondPoll(respondPoll: RespondPollDto, jwt: string): Promise<boolean>;
    getResultPoll(event_id: string, poll_id: string, jwt: string): Promise<any>;
}