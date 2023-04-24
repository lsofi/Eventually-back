import { ApiProperty } from "@nestjs/swagger";
import { CheckList } from "../request/updateActivity.dto";

export class UserInCharge{
    user_id: string;
    username: string;
    name: string;
    lastname: string;
}

export class GetActivityDto{
    public activity_id: string;

    @ApiProperty({
        example: "6317c1a96c3c794b8d3663ed",
        required: true,
        description: 'Es el event_id del evento al cual pertenece la actividad.'
    })
    public event_id: string;

    @ApiProperty({
        example: 'Servir comida',
        required: true,
        description: 'Es el nombre de la actividad.'
    })
    public name: string;

    public in_charge?: UserInCharge;

    @ApiProperty({
        example: '2023-09-15',
        required: false,
        description: 'Es la fecha de inicio de la actividad.'
    })
    public start_date?: string;

    @ApiProperty({
        example: '22:00',
        required: false,
        description: 'Es la hora de inicio de la actividad.'
    })
    public start_time?: string;

    @ApiProperty({
        example: '2023-09-15',
        required: false,
        description: 'Es la fecha de finalización de la actividad.'
    })
    public end_date?: string;

    @ApiProperty({
        example: '23:30',
        required: false,
        description: 'Es la hora de finalización de la actividad.'
    })
    public end_time?: string;

    @ApiProperty({
        example: true,
        required: false,
        description: 'Es un valor booleano que indica si se completó o no la actividad.'
    })
    public complete?: boolean;
    
    detail?: string;

    checklist?: CheckList[];
}