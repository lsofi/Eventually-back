import { AnswerApplicationSubscriberDto } from "../dto/request/answerApplicationSubscriber.dto";
import { DeleteTransportDto } from "../dto/request/deleteTransport.dto";
import { SubscribeToTransportDto } from "../dto/request/subscribeToTransport.dto";
import { UnSubscribeToTransportDto } from "../dto/request/unsubscribeToTransport.dto";
import { TransportDto } from "../dto/transport.dto";

export interface TransportServiceInterface {
    createTransport(transport: TransportDto, jwt: string): Promise<boolean>;
    deleteTransport(deleteTransport: DeleteTransportDto, jwt: string): Promise<boolean>;
    updateTransport(updateTransport: TransportDto, jwt: string) : Promise<boolean>;
    getTransport(event_id: string, transport_id: string, jwt: string): Promise<TransportDto>;
    subscribeToTransport(subscribeToTransport: SubscribeToTransportDto, jwt: string): Promise<boolean>;
    unsubscribeToTransport(unsubscribeToTransport: UnSubscribeToTransportDto, jwt: string): Promise<boolean>;
    answerApplicationSubscriber(answerApplicationSubscriber: AnswerApplicationSubscriberDto, jwt: string): Promise<boolean>;
    getEventTransports(event_id: string, jwt:string): Promise<TransportDto[]>;
}