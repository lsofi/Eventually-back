import { ApiProperty } from "@nestjs/swagger";

export class GetGuestsDto{
    @ApiProperty({
        example: '6317c1a96c3c794b8d3663ed',
        required: true,
        description: 'Es el event_id del evento del cual se quieren ver los invitados.'
    })
    public event_id: string;
}