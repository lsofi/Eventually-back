import { ApiProperty } from "@nestjs/swagger";

export class StateHistoryDto {
    @ApiProperty({
        example: 'created',
        required: true,
        description: 'Es el nombre del estado.'
    })
    public state: string;

    @ApiProperty({
        example: '2023-09-15 19:00:00',
        required: true,
        description: 'Es la fecha en la cual inició el estado.'
    })
    public start_date: Date;

    @ApiProperty({
        example: '2023-09-16 19:00:00',
        required: false,
        description: 'Es la fecha en la cual finalizó el estado.'
    })
    public end_date?: Date;

    constructor(state, start_date, end_date){
        this.state = state,
        this.start_date = start_date,
        this.end_date = end_date
    }
}